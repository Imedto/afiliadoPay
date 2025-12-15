import { env } from "../../../lib/env";

export interface PublicCheckoutProduct {
  id: string;
  tenant_id: string;
  public_slug: string | null;
  code: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  is_public: boolean;
}

export interface PublicCheckoutConfig {
  template: "default" | "template_a" | "template_b" | "template_c";
  primary_color: string | null;
  secondary_color: string | null;
  success_redirect_url: string | null;
  cancel_redirect_url: string | null;
}

export interface PublicCheckoutResponse {
  product: PublicCheckoutProduct;
  checkoutConfig: PublicCheckoutConfig | null;
  plan?: {
    id: string;
    price: number;
    billing_type: "one_time" | "recurring";
  } | null;
}

export async function fetchPublicCheckout(
  slug: string,
): Promise<PublicCheckoutResponse> {
  const base = env.vendasApiUrl.replace("vendas-api", "checkout-public");
  const url = `${base}/${encodeURIComponent(slug)}`;

  const res = await fetch(url, {
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Erro ao carregar checkout (${res.status}): ${text || res.statusText}`,
    );
  }

  return (await res.json()) as PublicCheckoutResponse;
}

export interface CreateCheckoutPayload {
  slug: string;
  payment_method: "card" | "boleto" | "pix";
  affiliate_id?: string;
  buyer: {
    name: string;
    email: string;
    document: string;
  };
}

export interface CreateCheckoutResponse {
  sale_id: string;
  transaction_code: string;
  checkout_url: string;
}

export async function createPublicCheckout(
  payload: CreateCheckoutPayload,
): Promise<CreateCheckoutResponse> {
  const base = env.vendasApiUrl.replace("vendas-api", "checkout-create");
  const res = await fetch(base, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Erro ao criar checkout (${res.status}): ${text || res.statusText}`,
    );
  }

  return (await res.json()) as CreateCheckoutResponse;
}
