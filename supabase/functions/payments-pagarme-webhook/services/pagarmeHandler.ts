// deno-lint-ignore-file no-explicit-any
import { insertPaymentEvent, markPaymentEventProcessed, type PaymentEvent } from "../../payments-pagseguro-webhook/db/paymentEvents.ts";
import { supabaseAdmin } from "../../vendas-api/db/client.ts";

export interface PagarmeWebhookPayload {
  id?: string;
  type?: string;
  data?: {
    id?: string;
    object?: string;
    status?: string;
    metadata?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

const PROVIDER = "pagarme";

export async function handlePagarmeWebhook(
  payload: PagarmeWebhookPayload,
  requestId: string,
): Promise<{ event: PaymentEvent; alreadyProcessed: boolean }> {
  const eventId =
    payload.id ??
    payload.data?.id ??
    crypto.randomUUID();

  const payloadHash = await hashPayload(payload);

  const existing = await insertPaymentEvent(PROVIDER, eventId, payloadHash, payload);

  if (!existing) {
    throw new Error("Não foi possível registrar evento de pagamento Pagar.me.");
  }

  if (existing.status === "processed") {
    return { event: existing, alreadyProcessed: true };
  }

  await updateBillingFromPagarme(payload, requestId);

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

async function updateBillingFromPagarme(
  payload: PagarmeWebhookPayload,
  requestId: string,
): Promise<void> {
  const metadata = payload.data?.metadata ?? {};
  const reference = (metadata?.transaction_code as string | undefined)?.trim() ??
    (metadata?.sale_id as string | undefined)?.trim();

  if (!reference) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "pagarme_webhook_without_reference",
        requestId,
      }),
    );
    return;
  }

  const { data: sale, error } = await supabaseAdmin
    .from("billing_sales")
    .select("*")
    .or(`transaction_code.eq.${reference},id.eq.${reference}`)
    .maybeSingle<any>();

  if (error) {
    console.error("Erro ao buscar billing_sales a partir do webhook Pagar.me", error);
    return;
  }

  if (!sale) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "pagarme_webhook_sale_not_found",
        requestId,
        reference,
      }),
    );
    return;
  }

  const mappedStatus = mapPagarmeStatus(payload.data?.status);

  const { error: updateError } = await supabaseAdmin
    .from("billing_sales")
    .update({
      status: mappedStatus,
      finalized_at: new Date().toISOString(),
    })
    .eq("id", sale.id);

  if (updateError) {
    console.error(
      "Erro ao atualizar billing_sales a partir do webhook Pagar.me",
      updateError,
    );
  }

  await ensureCommissionAndMemberships(sale, requestId);
}

function mapPagarmeStatus(status: string | undefined): number {
  // Mapeamento simplificado:
  // Pagar.me usa status como "paid", "canceled", etc.
  if (!status) return 0;
  const normalized = status.toLowerCase();
  if (normalized === "paid") return 3;
  if (normalized === "canceled" || normalized === "canceled_by_merchant") return 7;
  return 0;
}

async function ensureCommissionAndMemberships(sale: any, requestId: string): Promise<void> {
  // Cria comissão para afiliado, se aplicável
  if (sale.affiliate_id && sale.comissao_afiliado && Number(sale.comissao_afiliado) > 0) {
    const { data: existingCommission, error: commissionQueryError } = await supabaseAdmin
      .from("commissions")
      .select("id")
      .eq("sale_id", sale.id)
      .eq("affiliate_id", sale.affiliate_id)
      .maybeSingle<any>();

    if (commissionQueryError) {
      console.error("Erro ao verificar comissão existente (Pagar.me)", commissionQueryError);
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
        console.error("Erro ao criar comissão (Pagar.me)", insertCommissionError);
      }
    }
  }

  // Reutiliza mesma lógica de memberships do handler PagSeguro
  await ensureMembershipsForSale(sale, requestId);
}

async function ensureMembershipsForSale(sale: any, requestId: string): Promise<void> {
  if (sale.status !== 3) {
    return;
  }

  const buyerEmail = (sale.buyer_email as string | undefined)?.trim();
  if (!buyerEmail) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "pagarme_membership_skip_no_buyer_email",
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
        message: "pagarme_membership_user_not_found_for_email",
        requestId,
        saleId: sale.id,
        buyerEmail,
      }),
    );
    return;
  }

  const userId = user.id;

  const { data: mappings, error: mappingsError } = await supabaseAdmin
    .from("course_products")
    .select("course_id")
    .eq("tenant_id", sale.tenant_id)
    .eq("product_id", sale.product_id);

  if (mappingsError) {
    console.error("Erro ao buscar course_products (Pagar.me)", mappingsError);
    return;
  }

  if (!mappings || !mappings.length) {
    console.log(
      JSON.stringify({
        level: "info",
        message: "pagarme_membership_no_course_mapping",
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
      console.error("Erro ao verificar membership existente (Pagar.me)", membershipQueryError);
      continue;
    }

    if (existingMembership) {
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
      console.error("Erro ao criar membership (Pagar.me)", insertMembershipError);
    } else {
      console.log(
        JSON.stringify({
          level: "info",
          message: "pagarme_membership_created_from_sale",
          requestId,
          saleId: sale.id,
          courseId,
          userId,
        }),
      );
    }
  }
}

