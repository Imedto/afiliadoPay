import { supabase } from "../../../lib/supabaseClient";

export interface AffiliateLink {
  id: string;
  tenant_id: string;
  affiliate_id: string;
  product_id: string;
  slug: string;
  created_at: string;
  product?: {
    name: string;
    code: string;
  } | null;
}

export interface CreateAffiliateLinkInput {
  tenantId: string;
  affiliateId: string;
  productId: string;
  slug: string;
}

export async function fetchAffiliateLinksByAffiliate(
  affiliateId: string,
): Promise<AffiliateLink[]> {
  const { data, error } = await supabase
    .from("affiliate_links")
    .select("id, tenant_id, affiliate_id, product_id, slug, created_at, product:product_id(name, code)")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AffiliateLink[];
}

export async function createAffiliateLink(
  input: CreateAffiliateLinkInput,
): Promise<AffiliateLink> {
  const { data, error } = await supabase
    .from("affiliate_links")
    .insert({
      tenant_id: input.tenantId,
      affiliate_id: input.affiliateId,
      product_id: input.productId,
      slug: input.slug,
    })
    .select("id, tenant_id, affiliate_id, product_id, slug, created_at, product:product_id(name, code)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AffiliateLink;
}

