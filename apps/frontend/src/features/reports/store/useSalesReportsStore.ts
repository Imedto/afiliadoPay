import { defineStore } from "pinia";
import {
  fetchDailySalesSummary,
  fetchProductSalesSummary,
  fetchAffiliatePerformance,
  type DailySalesSummary,
  type ProductSalesSummary,
  type SalesReportFilters,
} from "../api/reportsApi";
import type { AffiliateStats } from "../../affiliates/api/affiliateStatsApi";

interface SalesReportsState {
  dailyItems: DailySalesSummary[];
  productItems: ProductSalesSummary[];
  affiliateItems: AffiliateStats[];
  filters: SalesReportFilters;
  loading: boolean;
  error: string | null;
}

export const useSalesReportsStore = defineStore("salesReports", {
  state: (): SalesReportsState => ({
    dailyItems: [],
    productItems: [],
    affiliateItems: [],
    filters: {},
    loading: false,
    error: null,
  }),
  actions: {
    async load(filters: SalesReportFilters) {
      this.loading = true;
      this.error = null;
      this.filters = filters;

      try {
        const [daily, products, affiliates] = await Promise.all([
          fetchDailySalesSummary(filters),
          fetchProductSalesSummary(filters),
          fetchAffiliatePerformance(),
        ]);
        this.dailyItems = daily;
        this.productItems = products;
        this.affiliateItems = affiliates;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar relatório de vendas.";
      } finally {
        this.loading = false;
      }
    },
  },
});
