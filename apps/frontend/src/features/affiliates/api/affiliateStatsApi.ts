import { supabase } from "../../../lib/supabaseClient";

export interface AffiliateStats {
  affiliate_id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  total_clicks: number;
  total_paid_sales: number;
  total_commission_amount: number;
}

export async function fetchAffiliateStats(): Promise<AffiliateStats[]> {
  const { data, error } = await supabase
    .from("affiliate_stats")
    .select(
      "affiliate_id, tenant_id, name, email, total_clicks, total_paid_sales, total_commission_amount",
    );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AffiliateStats[];
}

