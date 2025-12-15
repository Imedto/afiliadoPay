// Serviço de domínio simplificado para tratar webhooks do PagSeguro.
// Aqui apenas registramos o evento e deixamos um ponto de extensão para
// atualizar billing_sales / commissions futuramente.

import { insertPaymentEvent, markPaymentEventProcessed, type PaymentEvent } from "../db/paymentEvents.ts";
import { supabaseAdmin } from "../vendas-api/db/client.ts";

export interface PagseguroWebhookPayload {
  notificationCode?: string;
  notificationType?: string;
  reference?: string;
  status?: string | number;
  [key: string]: unknown;
}

const PROVIDER = "pagseguro";

export async function handlePagseguroWebhook(
  payload: PagseguroWebhookPayload,
  requestId: string,
): Promise<{ event: PaymentEvent; alreadyProcessed: boolean }> {
  const eventId =
    (payload.notificationCode as string | undefined) ??
    (payload.reference as string | undefined) ??
    crypto.randomUUID();

  const payloadHash = await hashPayload(payload);

  const existing = await insertPaymentEvent(PROVIDER, eventId, payloadHash, payload);

  if (!existing) {
    throw new Error("Não foi possível registrar evento de pagamento.");
  }

  // Se já existe e já foi processado, consideramos idempotente
  if (existing.status === "processed") {
    return { event: existing, alreadyProcessed: true };
  }

  // A partir daqui, processamos a venda e comissões relacionadas
  await updateBillingFromPagseguro(payload, requestId);

  await markPaymentEventProcessed(PROVIDER, eventId);

  return { event: existing, alreadyProcessed: false };
}

async function hashPayload(payload: unknown): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function updateBillingFromPagseguro(
  payload: PagseguroWebhookPayload,
  requestId: string,
): Promise<void> {
  const reference = (payload.reference as string | undefined)?.trim();
  if (!reference) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "pagseguro_webhook_without_reference",
        requestId,
      }),
    );
    return;
  }

  // Busca venda pelo código de transação ou id
  const { data: sale, error } = await supabaseAdmin
    .from("billing_sales")
    .select("*")
    .or(`transaction_code.eq.${reference},id.eq.${reference}`)
    .maybeSingle<any>();

  if (error) {
    console.error("Erro ao buscar billing_sales a partir do webhook PagSeguro", error);
    return;
  }

  if (!sale) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "pagseguro_webhook_sale_not_found",
        requestId,
        reference,
      }),
    );
    return;
  }

  // Atualiza status básico da venda (ex.: 3 = pago)
  const mappedStatus = mapPagseguroStatus(payload.status);

  const { error: updateError } = await supabaseAdmin
    .from("billing_sales")
    .update({
      status: mappedStatus,
      finalized_at: new Date().toISOString(),
    })
    .eq("id", sale.id);

  if (updateError) {
    console.error(
      "Erro ao atualizar billing_sales a partir do webhook PagSeguro",
      updateError,
    );
  }

  // Cria comissão para afiliado, se aplicável
  if (sale.affiliate_id && sale.comissao_afiliado && Number(sale.comissao_afiliado) > 0) {
    const { data: existingCommission, error: commissionQueryError } = await supabaseAdmin
      .from("commissions")
      .select("id")
      .eq("sale_id", sale.id)
      .eq("affiliate_id", sale.affiliate_id)
      .maybeSingle<any>();

    if (commissionQueryError) {
      console.error("Erro ao verificar comissão existente", commissionQueryError);
    } else if (!existingCommission) {
      const { error: insertCommissionError } = await supabaseAdmin
        .from("commissions")
        .insert({
          tenant_id: sale.tenant_id,
          sale_id: sale.id,
          affiliate_id: sale.affiliate_id,
          amount: sale.comissao_afiliado,
          status: "pending",
        });

      if (insertCommissionError) {
        console.error("Erro ao criar comissão", insertCommissionError);
      }
    }
  }

  // Cria memberships (acesso a cursos) se existir mapeamento curso-produto
  await ensureMembershipsForSale(sale, requestId);
}

function mapPagseguroStatus(status: string | number | undefined): number {
  // Mapeamento simplificado:
  // PagSeguro: 3 = pago, 7 = cancelado, etc.
  // Aqui traduzimos apenas os principais para inteiros genéricos,
  // mantendo compatibilidade com billing_sales.status.
  const raw = typeof status === "string" ? parseInt(status, 10) : status;
  if (raw === 3) return 3; // pago
  if (raw === 7) return 7; // cancelado
  return raw && !Number.isNaN(raw) ? raw : 0;
}

async function ensureMembershipsForSale(sale: any, requestId: string): Promise<void> {
  // Só liberamos área de membros para vendas com status "pago"
  if (sale.status !== 3) {
    return;
  }

  // Descobre o usuário (membro) pelo email do comprador
  const buyerEmail = (sale.buyer_email as string | undefined)?.trim();
  if (!buyerEmail) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "membership_skip_no_buyer_email",
        requestId,
        saleId: sale.id,
      }),
    );
    return;
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.admin.getUserByEmail(buyerEmail);

  if (userError || !user) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "membership_user_not_found_for_email",
        requestId,
        saleId: sale.id,
        buyerEmail,
      }),
    );
    return;
  }

  const userId = user.id;

  // Busca mapeamentos curso-produto para este tenant/produto
  const { data: mappings, error: mappingsError } = await supabaseAdmin
    .from("course_products")
    .select("course_id")
    .eq("tenant_id", sale.tenant_id)
    .eq("product_id", sale.product_id);

  if (mappingsError) {
    console.error("Erro ao buscar course_products", mappingsError);
    return;
  }

  if (!mappings || !mappings.length) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "membership_no_course_mapping",
        requestId,
        saleId: sale.id,
      }),
    );
    return;
  }

  for (const mapping of mappings) {
    const courseId = mapping.course_id;

    const { data: existingMembership, error: membershipQueryError } = await supabaseAdmin
      .from("memberships")
      .select("id, status")
      .eq("tenant_id", sale.tenant_id)
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle<any>();

    if (membershipQueryError) {
      console.error("Erro ao verificar membership existente", membershipQueryError);
      continue;
    }

    if (existingMembership) {
      // Se existir e estiver cancelada/expirada, poderia reativar; por enquanto mantemos como está.
      continue;
    }

    const { error: insertMembershipError } = await supabaseAdmin.from("memberships").insert({
      tenant_id: sale.tenant_id,
      user_id: userId,
      course_id: courseId,
      sale_id: sale.id,
      status: "active",
      started_at: new Date().toISOString(),
    });

    if (insertMembershipError) {
      console.error("Erro ao criar membership", insertMembershipError);
    } else {
      console.log(
        JSON.stringify({
          level: "info",
          message: "membership_created_from_sale",
          requestId,
          saleId: sale.id,
          courseId,
          userId,
        }),
      );
    }
  }
}

