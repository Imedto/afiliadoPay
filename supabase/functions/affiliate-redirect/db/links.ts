// Acesso a dados para links de afiliados
// deno-lint-ignore-file no-explicit-any
import { supabaseAdmin } from "../vendas-api/db/client.ts";

export interface AffiliateLinkRecord {
  id: string;
  tenant_id: string;
  affiliate_id: string;
  product: {
    public_slug: string | null;
  } | null;
}

export async function findAffiliateLinkBySlug(
  slug: string,
): Promise<AffiliateLinkRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("affiliate_links")
    .select("id, tenant_id, affiliate_id, product:product_id(public_slug)")
    .eq("slug", slug)
    .maybeSingle<any>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return data as AffiliateLinkRecord;
}

export async function registerAffiliateClick(
  tenantId: string,
  linkId: string,
): Promise<void> {
  const { error } = await supabaseAdmin.from("affiliate_clicks").insert({
    tenant_id: tenantId,
    link_id: linkId,
  });

  if (error) {
    // Não interrompe o fluxo principal de redirecionamento.
    console.error("affiliate_click_insert_error", error);
  }
}
