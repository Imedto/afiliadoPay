import { defineStore } from "pinia";
import {
  fetchAffiliateSales,
  type AffiliateSale,
} from "../api/affiliateSalesApi";

interface AffiliateSalesState {
  itemsByAffiliate: Record<string, AffiliateSale[]>;
  loading: boolean;
  error: string | null;
}

export const useAffiliateSalesStore = defineStore("affiliateSales", {
  state: (): AffiliateSalesState => ({
    itemsByAffiliate: {},
    loading: false,
    error: null,
  }),
  actions: {
    async loadForAffiliate(affiliateId: string) {
      this.loading = true;
      this.error = null;
      try {
        const items = await fetchAffiliateSales(affiliateId);
        this.itemsByAffiliate[affiliateId] = items;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar vendas do afiliado.";
      } finally {
        this.loading = false;
      }
    },
  },
});

