import { defineStore } from "pinia";
import { fetchSales, type SalesFilters, type VendasApiResponse } from "../api/salesApi";

interface SalesState {
  loading: boolean;
  error: string | null;
  data: VendasApiResponse | null;
  filters: SalesFilters;
}

export const useSalesStore = defineStore("sales", {
  state: (): SalesState => ({
    loading: false,
    error: null,
    data: null,
    filters: {
      page: 1,
    },
  }),
  actions: {
    setFilters(partial: Partial<SalesFilters>) {
      this.filters = {
        ...this.filters,
        ...partial,
      };
    },
    async loadSales(apiKey: string) {
      this.loading = true;
      this.error = null;

      try {
        this.data = await fetchSales(apiKey, this.filters);
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Erro desconhecido ao carregar vendas";
      } finally {
        this.loading = false;
      }
    },
  },
});

