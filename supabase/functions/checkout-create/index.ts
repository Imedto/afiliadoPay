// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { supabaseAdmin } from "../vendas-api/db/client.ts";
import { HttpError, jsonResponse } from "../payments-pagseguro-webhook/utils/errors.ts";
import { log } from "../payments-pagseguro-webhook/utils/logger.ts";

const PAGSEGURO_EMAIL = Deno.env.get("PAGSEGURO_EMAIL") ?? "";
const PAGSEGURO_TOKEN = Deno.env.get("PAGSEGURO_TOKEN") ?? "";
const PAGSEGURO_ENV = Deno.env.get("PAGSEGURO_ENV") ?? "sandbox";

const PAGSEGURO_WS_BASE =
  PAGSEGURO_ENV === "production"
    ? "https://ws.pagseguro.uol.com.br"
    : "https://ws.sandbox.pagseguro.uol.com.br";

const PAGSEGURO_CHECKOUT_REDIRECT_BASE =
  PAGSEGURO_ENV === "production"
    ? "https://pagseguro.uol.com.br/v2/checkout/payment.html?code="
    : "https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=";

const PAGARME_API_KEY = Deno.env.get("PAGARME_API_KEY") ?? "";

const bodySchema = z.object({
  slug: z.string().min(1),
  payment_method: z.enum(["card", "boleto", "pix"]),
  affiliate_id: z.string().uuid().optional(),
  buyer: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    document: z.string().min(8),
  }),
});

serve(async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use POST");
    }

    let raw: any;
    try {
      const text = await req.text();
      raw = text ? JSON.parse(text) : {};
    } catch {
      throw new HttpError(400, "invalid_json", "Corpo JSON inválido.");
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      throw new HttpError(400, "invalid_body", parsed.error.message);
    }

    const { slug, payment_method, buyer, affiliate_id } = parsed.data;

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, tenant_id, code, name, description, created_by")
      .eq("public_slug", slug)
      .eq("is_public", true)
      .eq("status", "active" as any)
      .maybeSingle<any>();

    if (productError) {
      log("error", "checkout_create_product_error", { requestId, error: productError });
      throw new HttpError(500, "db_error", "Erro ao localizar produto.");
    }

    if (!product) {
      throw new HttpError(404, "product_not_found", "Produto não encontrado ou inativo.");
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from("product_plans")
      .select("id, price")
      .eq("tenant_id", product.tenant_id)
      .eq("product_id", product.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<any>();

    if (planError) {
      log("error", "checkout_create_plan_error", { requestId, error: planError });
      throw new HttpError(500, "db_error", "Erro ao localizar plano do produto.");
    }

    if (!plan) {
      throw new HttpError(400, "plan_not_configured", "Produto sem plano de preço configurado.");
    }

    const paymentMethodCode = payment_method === "card" ? 1 : payment_method === "boleto" ? 2 : 3;

    // Produtor (dono do tenant) - usamos o created_by como produtor principal
    const producerId = product.created_by as string;

    // Se veio um affiliate_id, validamos se pertence ao mesmo tenant e está ativo.
    let affiliateId: string | null = null;
    if (affiliate_id) {
      const { data: affiliate, error: affiliateError } = await supabaseAdmin
        .from("affiliates")
        .select("id, tenant_id, status")
        .eq("id", affiliate_id)
        .maybeSingle<any>();

      if (affiliateError) {
        log("warn", "checkout_create_affiliate_lookup_error", {
          requestId,
          error: affiliateError,
        });
      } else if (
        affiliate &&
        affiliate.tenant_id === product.tenant_id &&
        affiliate.status === "active"
      ) {
        affiliateId = affiliate.id as string;
      } else if (affiliate) {
        log("info", "checkout_create_affiliate_ignored", {
          requestId,
          affiliateId: affiliate.id,
          reason: "tenant_mismatch_or_inactive",
        });
      }
    }

    const transactionCode = crypto.randomUUID();

    // Carrega configuração de checkout para gateway e comissão de afiliado
    const { data: checkoutConfig, error: checkoutConfigError } = await supabaseAdmin
      .from("product_checkout_configs")
      .select("payment_gateway_id, affiliate_commission_type, affiliate_commission_value")
      .eq("tenant_id", product.tenant_id)
      .eq("product_id", product.id)
      .maybeSingle<any>();

    if (checkoutConfigError) {
      log("error", "checkout_create_config_error", {
        requestId,
        error: checkoutConfigError,
      });
      throw new HttpError(500, "db_error", "Erro ao carregar configuração de checkout.");
    }

    // Calcula comissão do afiliado (se houver)
    let affiliateCommission: number | null = null;
    if (
      affiliateId &&
      checkoutConfig &&
      checkoutConfig.affiliate_commission_value !== null &&
      Number(checkoutConfig.affiliate_commission_value) > 0
    ) {
      const basePrice = Number(plan.price);
      const value = Number(checkoutConfig.affiliate_commission_value);

      if (checkoutConfig.affiliate_commission_type === "fixed") {
        affiliateCommission = Math.max(0, Math.min(value, basePrice));
      } else {
        // percent
        affiliateCommission = Math.max(
          0,
          Math.min((basePrice * value) / 100, basePrice),
        );
      }
    }

    const { data: sale, error: saleError } = await supabaseAdmin
      .from("billing_sales")
      .insert({
        tenant_id: product.tenant_id,
        producer_id: producerId,
        affiliate_id: affiliateId,
        product_id: product.id,
        product_code: product.code,
        product_name: product.name,
        product_price: plan.price,
        plan_id: plan.id,
        plan_code: null,
        plan_name: null,
        plan_price: plan.price,
        plan_items: 1,
        order_bumps: [],
        transaction_code: transactionCode,
        payment_method: paymentMethodCode,
        status: 0, -- aguardando pagamento
        valor_produto: plan.price,
        valor_bruto: plan.price,
        valor_frete: 0,
        valor_desconto: 0,
        valor_liquido: plan.price,
        comissao_afiliado: affiliateCommission,
        buyer_name: buyer.name,
        buyer_email: buyer.email,
        buyer_cpf_cnpj: buyer.document,
      })
      .select("*")
      .single<any>();

    if (saleError) {
      log("error", "checkout_create_sale_error", { requestId, error: saleError });
      throw new HttpError(500, "db_error", "Erro ao registrar venda.");
    }

    // Criação do link de pagamento no PagSeguro
    // Decide o gateway a partir da configuração de checkout

    let provider: "pagseguro" | "pagarme" | null = "pagseguro";

    if (checkoutConfig?.payment_gateway_id) {
      const { data: gateway, error: gatewayError } = await supabaseAdmin
        .from("payment_gateways")
        .select("provider")
        .eq("id", checkoutConfig.payment_gateway_id)
        .maybeSingle<any>();

      if (gatewayError) {
        log("error", "checkout_create_gateway_error", {
          requestId,
          error: gatewayError,
        });
        throw new HttpError(
          500,
          "db_error",
          "Erro ao carregar gateway de pagamento configurado.",
        );
      }

      if (gateway?.provider === "pagarme") {
        provider = "pagarme";
      }
    }

    let checkoutUrl: string;
    if (provider === "pagseguro") {
      checkoutUrl = await createPagseguroLinkPayment({
        saleId: sale.id,
        transactionCode,
        productName: product.name,
        amount: plan.price,
        buyer,
        requestId,
      });
    } else {
      // Stub de Pagar.me: preparado para integração futura
      checkoutUrl = await createPagarmeLinkPayment({
        saleId: sale.id,
        transactionCode,
        productName: product.name,
        amount: plan.price,
        buyer,
        requestId,
      });
    }

    log("info", "checkout_create_success", {
      requestId,
      saleId: sale.id,
      productId: product.id,
    });

    return jsonResponse(200, {
      sale_id: sale.id,
      transaction_code: transactionCode,
      checkout_url: checkoutUrl,
    });
  } catch (err) {
    if (err instanceof HttpError) {
      log("warn", "checkout_create_http_error", {
        requestId,
        status: err.status,
        code: err.code,
        message: err.message,
      });
      return jsonResponse(err.status, { error: err.code, message: err.message });
    }

    if (err instanceof z.ZodError) {
      log("warn", "checkout_create_zod_error", {
        requestId,
        issues: err.issues,
      });
      return jsonResponse(400, {
        error: "invalid_body",
        message: err.message,
      });
    }

    log("error", "checkout_create_unexpected_error", {
      requestId,
      error: String(err),
    });

    return jsonResponse(500, {
      error: "internal_error",
      message: "Erro interno ao criar checkout.",
    });
  }
});

interface PagseguroLinkParams {
  saleId: string;
  transactionCode: string;
  productName: string;
  amount: number;
  buyer: {
    name: string;
    email: string;
    document: string;
  };
  requestId: string;
}

async function createPagseguroLinkPayment(params: PagseguroLinkParams): Promise<string> {
  if (!PAGSEGURO_EMAIL || !PAGSEGURO_TOKEN) {
    throw new HttpError(
      500,
      "pagseguro_config_missing",
      "Configuração do PagSeguro ausente no ambiente.",
    );
  }

  const endpoint = `${PAGSEGURO_WS_BASE}/v2/checkout?email=${encodeURIComponent(PAGSEGURO_EMAIL)}&token=${encodeURIComponent(PAGSEGURO_TOKEN)}`;

  const body = new URLSearchParams();
  body.set("currency", "BRL");
  body.set("reference", params.transactionCode);
  body.set("itemId1", params.saleId);
  body.set("itemDescription1", params.productName.substring(0, 95));
  body.set("itemAmount1", params.amount.toFixed(2));
  body.set("itemQuantity1", "1");

  body.set("senderName", params.buyer.name);
  body.set("senderEmail", params.buyer.email);

  // Por questões de LGPD, não enviamos o CPF/CNPJ aqui sem revisar a necessidade;
  // caso seja obrigatório pela integração escolhida, você pode adicionar o campo
  // seguindo a documentação oficial do PagSeguro.

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=ISO-8859-1",
    },
    body: body.toString(),
  });

  const text = await response.text();

  if (!response.ok) {
    log("error", "pagseguro_checkout_http_error", {
      status: response.status,
      body: text.slice(0, 500),
      requestId: params.requestId,
    });
    throw new HttpError(
      502,
      "pagseguro_checkout_error",
      "Erro ao criar link de pagamento no PagSeguro.",
    );
  }

  const codeMatch = text.match(/<code>([^<]+)<\/code>/i);
  if (!codeMatch || !codeMatch[1]) {
    log("error", "pagseguro_checkout_code_not_found", {
      body: text.slice(0, 500),
      requestId: params.requestId,
    });
    throw new HttpError(
      502,
      "pagseguro_checkout_code_missing",
      "Não foi possível obter o código de checkout do PagSeguro.",
    );
  }

  const checkoutCode = codeMatch[1].trim();
  return `${PAGSEGURO_CHECKOUT_REDIRECT_BASE}${encodeURIComponent(checkoutCode)}`;
}

interface PagarmeLinkParams {
  saleId: string;
  transactionCode: string;
  productName: string;
  amount: number;
  buyer: {
    name: string;
    email: string;
    document: string;
  };
  requestId: string;
}

async function createPagarmeLinkPayment(_params: PagarmeLinkParams): Promise<string> {
  if (!PAGARME_API_KEY) {
    throw new HttpError(
      500,
      "pagarme_config_missing",
      "Configuração do Pagar.me ausente no ambiente.",
    );
  }

  // Exemplo baseado na API de Orders do Pagar.me (ajuste o endpoint/campos conforme
  // a versão da API que você utilizar).
  const endpoint = "https://api.pagar.me/core/v5/orders";

  const body = {
    items: [
      {
        amount: Math.round(_params.amount * 100),
        description: _params.productName.substring(0, 180),
        quantity: 1,
        code: _params.saleId,
      },
    ],
    customer: {
      name: _params.buyer.name,
      email: _params.buyer.email,
      // Por LGPD, o documento só deve ser enviado se realmente obrigatório;
      // aqui mantemos um campo opcional que você pode ajustar conforme a
      // documentação do Pagar.me.
    },
    metadata: {
      sale_id: _params.saleId,
      transaction_code: _params.transactionCode,
    },
    payments: [
      {
        payment_method: "checkout",
        checkout: {
          expires_in: 30,
          default_payment_method: "credit_card",
          success_url: "",
          skip_checkout_success_page: false,
        },
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${PAGARME_API_KEY}:`)}`,
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();

  if (!response.ok) {
    log("error", "pagarme_checkout_http_error", {
      status: response.status,
      body: JSON.stringify(json).slice(0, 500),
      requestId: _params.requestId,
    });
    throw new HttpError(
      502,
      "pagarme_checkout_error",
      "Erro ao criar link de pagamento no Pagar.me.",
    );
  }

  const checkoutUrl: string | undefined =
    json.checkout_url ?? json.checkout?.payment_url ?? json.checkouts?.[0]?.payment_url;

  if (!checkoutUrl) {
    log("error", "pagarme_checkout_url_not_found", {
      body: JSON.stringify(json).slice(0, 500),
      requestId: _params.requestId,
    });
    throw new HttpError(
      502,
      "pagarme_checkout_url_missing",
      "Não foi possível obter a URL de checkout do Pagar.me.",
    );
  }

  return checkoutUrl;
}
