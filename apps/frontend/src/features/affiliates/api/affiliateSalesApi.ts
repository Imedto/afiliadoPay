import { supabase } from "../../../lib/supabaseClient";

export interface AffiliateSale {
  sale_id: string;
  tenant_id: string;
  affiliate_id: string;
  affiliate_name: string;
  product_id: string;
  product_code: string;
  product_name: string;
  status: number;
  valor_bruto: number;
  valor_liquido: number;
  comissao_afiliado: number | null;
  created_at: string;
  finalized_at: string | null;
}

export async function fetchAffiliateSales(
  affiliateId: string,
): Promise<AffiliateSale[]> {
  const { data, error } = await supabase
    .from("affiliate_sales")
    .select(
      "sale_id, tenant_id, affiliate_id, affiliate_name, product_id, product_code, product_name, status, valor_bruto, valor_liquido, comissao_afiliado, created_at, finalized_at",
    )
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AffiliateSale[];
}

