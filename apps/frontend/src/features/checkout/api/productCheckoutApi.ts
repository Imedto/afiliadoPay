import { supabase } from "../../../lib/supabaseClient";

export type CheckoutTemplate = "default" | "template_a" | "template_b" | "template_c";
export type AffiliateCommissionType = "percent" | "fixed";

export interface ProductCheckoutConfig {
  id: string;
  tenant_id: string;
  product_id: string;
  template: CheckoutTemplate;
  payment_gateway_id: string | null;
   affiliate_commission_type: AffiliateCommissionType | null;
   affiliate_commission_value: number | null;
  primary_color: string | null;
  secondary_color: string | null;
  success_redirect_url: string | null;
  cancel_redirect_url: string | null;
}

export interface UpsertCheckoutConfigInput {
  tenantId: string;
  productId: string;
  template: CheckoutTemplate;
  paymentGatewayId?: string | null;
  affiliateCommissionType?: AffiliateCommissionType | null;
  affiliateCommissionValue?: number | null;
  primaryColor?: string;
  secondaryColor?: string;
  successRedirectUrl?: string;
  cancelRedirectUrl?: string;
}

export async function fetchCheckoutConfig(
  tenantId: string,
  productId: string,
): Promise<ProductCheckoutConfig | null> {
  const { data, error } = await supabase
    .from("product_checkout_configs")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("product_id", productId)
    .maybeSingle<ProductCheckoutConfig>();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = row not found
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function upsertCheckoutConfig(
  input: UpsertCheckoutConfigInput,
): Promise<ProductCheckoutConfig> {
  const { data, error } = await supabase
    .from("product_checkout_configs")
    .upsert(
      {
        tenant_id: input.tenantId,
        product_id: input.productId,
        template: input.template,
        payment_gateway_id: input.paymentGatewayId ?? null,
        affiliate_commission_type: input.affiliateCommissionType ?? null,
        affiliate_commission_value: input.affiliateCommissionValue ?? null,
        primary_color: input.primaryColor ?? null,
        secondary_color: input.secondaryColor ?? null,
        success_redirect_url: input.successRedirectUrl ?? null,
        cancel_redirect_url: input.cancelRedirectUrl ?? null,
      },
      {
        onConflict: "tenant_id,product_id",
      },
    )
    .select("*")
    .single<ProductCheckoutConfig>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
