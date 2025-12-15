import { supabase } from "../../../lib/supabaseClient";
import type { AffiliateStats } from "../../affiliates/api/affiliateStatsApi";
import type { AffiliateSale } from "../../affiliates/api/affiliateSalesApi";
import type { AffiliateLink } from "../../affiliates/api/affiliateLinksApi";

export type MyAffiliateStats = AffiliateStats;
export type MyAffiliateSale = AffiliateSale;
export interface MyAffiliateCommission {
  commission_id: string;
  tenant_id: string;
  sale_id: string;
  affiliate_id: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "cancelled";
  created_at: string;
  paid_at: string | null;
}

export interface AffiliatePeriodFilters {
  startDate?: string;
  endDate?: string;
}

export async function fetchMyAffiliateStats(): Promise<MyAffiliateStats[]> {
  const { data, error } = await supabase
    .from("my_affiliate_stats")
    .select(
      "affiliate_id, tenant_id, name, email, total_clicks, total_paid_sales, total_commission_amount",
    );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MyAffiliateStats[];
}

export async function fetchMyAffiliateSales(
  filters: AffiliatePeriodFilters,
): Promise<MyAffiliateSale[]> {
  let query = supabase
    .from("my_affiliate_sales")
    .select(
      "sale_id, tenant_id, affiliate_id, affiliate_name, product_id, product_code, product_name, status, valor_bruto, valor_liquido, comissao_afiliado, created_at, finalized_at",
    )
    .order("created_at", { ascending: false });

  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    const end = `${filters.endDate}T23:59:59.999Z`;
    query = query.lte("created_at", end);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MyAffiliateSale[];
}

export async function fetchMyAffiliateCommissions(
  filters: AffiliatePeriodFilters,
): Promise<MyAffiliateCommission[]> {
  let query = supabase
    .from("my_affiliate_commissions")
    .select(
      "commission_id, tenant_id, sale_id, affiliate_id, amount, status, created_at, paid_at",
    )
    .order("created_at", { ascending: false });

  if (filters.startDate) {
    query = query.gte("created_at", filters.startDate);
  }
  if (filters.endDate) {
    const end = `${filters.endDate}T23:59:59.999Z`;
    query = query.lte("created_at", end);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MyAffiliateCommission[];
}

export async function fetchMyAffiliateLinks(
  affiliateIds: string[],
): Promise<AffiliateLink[]> {
  if (!affiliateIds.length) return [];

  const { data, error } = await supabase
    .from("affiliate_links")
    .select(
      "id, tenant_id, affiliate_id, product_id, slug, created_at, product:product_id(name, code)",
    )
    .in("affiliate_id", affiliateIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AffiliateLink[];
}
