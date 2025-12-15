import { supabase } from "../../../lib/supabaseClient";
import type { AffiliateStats } from "../../affiliates/api/affiliateStatsApi";

export interface DailySalesSummary {
  day: string;
  tenant_id: string;
  product_id: string | null;
  affiliate_id: string | null;
  status: number;
  sales_count: number;
  total_bruto: number;
  total_liquido: number;
}

export interface SalesReportFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
  affiliateId?: string;
}

export interface ProductSalesSummary {
  product_id: string;
  product_code: string;
  product_name: string;
  sales_count: number;
  total_bruto: number;
  total_liquido: number;
}

export async function fetchDailySalesSummary(
  filters: SalesReportFilters,
): Promise<DailySalesSummary[]> {
  let query = supabase
    .from("sales_daily_summary")
    .select(
      "day, tenant_id, product_id, affiliate_id, status, sales_count, total_bruto, total_liquido",
    )
    .order("day", { ascending: true });

  if (filters.startDate) {
    query = query.gte("day", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("day", filters.endDate);
  }
  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }
  if (filters.affiliateId) {
    query = query.eq("affiliate_id", filters.affiliateId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DailySalesSummary[];
}

export async function fetchProductSalesSummary(
  filters: SalesReportFilters,
): Promise<ProductSalesSummary[]> {
  let query = supabase
    .from("billing_sales")
    .select(
      "product_id, product_code, product_name, sales_count:count(*), total_bruto:sum(valor_bruto), total_liquido:sum(valor_liquido)",
    )
    .eq("status", 3)
    .group("product_id, product_code, product_name")
    .order("total_liquido", { ascending: false });

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

  return (data ?? []) as ProductSalesSummary[];
}

export async function fetchAffiliatePerformance(): Promise<AffiliateStats[]> {
  const { data, error } = await supabase
    .from("affiliate_stats")
    .select(
      "affiliate_id, tenant_id, name, email, total_clicks, total_paid_sales, total_commission_amount",
    )
    .order("total_commission_amount", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AffiliateStats[];
}
