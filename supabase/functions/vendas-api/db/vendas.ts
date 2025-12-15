import { supabaseAdmin } from "./client.ts";
import type { SalesFilters } from "../utils/validation.ts";

export interface VendaRow {
  id: string;
  tenant_id: string;
  producer_id: string;
  affiliate_id: string | null;
  product_id: string;
  product_code: string;
  product_name: string;
  product_price: number;

  plan_id: string | null;
  plan_code: string | null;
  plan_name: string | null;
  plan_price: number | null;
  plan_items: number | null;

  order_bumps: Array<{
    plan_code: string;
    plan_name: string;
    price: number;
  }>;

  transaction_code: string;
  created_at: string;
  finalized_at: string | null;
  payment_method: number;
  status: number;

  checkout_url: string | null;
  boleto_url: string | null;
  boleto_linha_digitavel: string | null;
  boleto_vencimento: string | null;

  valor_produto: number;
  valor_bruto: number;
  valor_frete: number;
  valor_desconto: number;
  valor_liquido: number;
  comissao_afiliado: number | null;

  campaign_id: string | null;
  campaign_name: string | null;

  src: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_campaign: string | null;

  buyer_name: string;
  buyer_email: string;
  buyer_cpf_cnpj: string;
  buyer_phone: string | null;
  buyer_cep: string | null;
  buyer_street: string | null;
  buyer_number: string | null;
  buyer_complement: string | null;
  buyer_district: string | null;
  buyer_city: string | null;
  buyer_state: string | null;
  buyer_country: string | null;

  affiliate_name: string | null;
  affiliate_phone: string | null;
  affiliate_email: string | null;

  producer_name: string;
  producer_cpf_cnpj: string;
  producer_phone: string | null;
  producer_email: string | null;
}

export interface VendasQueryResult {
  items: VendaRow[];
  total: number;
  pages: number;
  sumValorLiquidoProdutor: number;
  sumComissaoAfiliado: number;
}

const PAGE_SIZE = 100;

export async function queryVendasForUser(
  tenantId: string,
  userId: string,
  filters: SalesFilters,
): Promise<VendasQueryResult> {
  const page = filters.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabaseAdmin
    .from("billing_sales")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .or(`producer_id.eq.${userId},affiliate_id.eq.${userId}`);

  if (filters.inicio || filters.fim) {
    const inicio = filters.inicio ?? filters.fim;
    const fim = filters.fim ?? filters.inicio;
    if (inicio) {
      query = query.gte("created_at", `${inicio} 00:00:00`);
    }
    if (fim) {
      query = query.lte("created_at", `${fim} 23:59:59`);
    }
  }

  if (filters.transacao) {
    query = query.or(
      `transaction_code.eq.${filters.transacao},id.eq.${filters.transacao}`,
    );
  }

  if (typeof filters.status === "number") {
    query = query.eq("status", filters.status);
  }

  if (filters.produto) {
    query = query.or(
      `product_code.eq.${filters.produto},product_id.eq.${filters.produto}`,
    );
  }

  if (filters.pagamento) {
    query = query.eq("payment_method", filters.pagamento);
  }

  if (filters.comprador) {
    const like = `%${filters.comprador}%`;
    query = query.or(
      [
        `buyer_name.ilike.${like}`,
        `buyer_email.ilike.${like}`,
        `buyer_cpf_cnpj.eq.${filters.comprador}`,
      ].join(","),
    );
  }

  const { data, error, count } = await query
    .order("id", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error querying billing_sales", error);
    throw error;
  }

  const items = (data ?? []) as unknown as VendaRow[];
  const total = count ?? 0;
  const pages = Math.ceil(total / PAGE_SIZE);

  let sumValorLiquidoProdutor = 0;
  let sumComissaoAfiliado = 0;

  for (const v of items) {
    sumValorLiquidoProdutor += v.valor_liquido ?? 0;
    if (v.comissao_afiliado) {
      sumComissaoAfiliado += v.comissao_afiliado;
    }
  }

  return {
    items,
    total,
    pages,
    sumValorLiquidoProdutor,
    sumComissaoAfiliado,
  };
}

