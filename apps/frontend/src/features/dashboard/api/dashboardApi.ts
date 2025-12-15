import { supabase } from "../../../lib/supabaseClient";

export interface DashboardStats {
  productsCount: number;
  salesCount: number;
  paidSalesCount: number;
  totalRevenue: number;
  affiliatesCount: number;
  activeMembershipsCount: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  let productsCount = 0;
  let salesCount = 0;
  let paidSalesCount = 0;
  let totalRevenue = 0;
  let affiliatesCount = 0;
  let activeMembershipsCount = 0;

  // Produtos (tabela sempre deve existir após migrations)
  {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (!error && typeof count === "number") {
      productsCount = count;
    }
  }

  // Vendas (billing_sales pode ainda não existir em dev)
  {
    const { count, error, status } = await supabase
      .from("billing_sales")
      .select("*", { count: "exact", head: true });

    if (error && status !== 404) {
      console.warn("Erro ao buscar billing_sales:", error.message);
    }

    if (!error && typeof count === "number") {
      salesCount = count;
    }

    // Vendas pagas e faturamento líquido total
    const { data: revenueRow, error: revenueError, status: revenueStatus } =
      await supabase
        .from("billing_sales")
        .select("total_liquido:sum(valor_liquido), paid_count:count(*)")
        .eq("status", 3)
        .maybeSingle();

    if (revenueError && revenueStatus !== 404) {
      console.warn("Erro ao calcular faturamento:", revenueError.message);
    }

    if (revenueRow) {
      paidSalesCount = Number(revenueRow.paid_count ?? 0);
      totalRevenue = Number(revenueRow.total_liquido ?? 0);
    }
  }

  // Afiliados ativos
  {
    const { count, error, status } = await supabase
      .from("affiliates")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (error && status !== 404) {
      console.warn("Erro ao buscar affiliates:", error.message);
    }

    if (!error && typeof count === "number") {
      affiliatesCount = count;
    }
  }

  // Memberships ativas (área de membros)
  {
    const { count, error, status } = await supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (error && status !== 404) {
      console.warn("Erro ao buscar memberships:", error.message);
    }

    if (!error && typeof count === "number") {
      activeMembershipsCount = count;
    }
  }

  return {
    productsCount,
    salesCount,
    paidSalesCount,
    totalRevenue,
    affiliatesCount,
    activeMembershipsCount,
  };
}
