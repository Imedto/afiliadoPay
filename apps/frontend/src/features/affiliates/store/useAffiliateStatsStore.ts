import { defineStore } from "pinia";
import {
  fetchAffiliateStats,
  type AffiliateStats,
} from "../api/affiliateStatsApi";

interface AffiliateStatsState {
  itemsByAffiliate: Record<string, AffiliateStats>;
  loading: boolean;
  error: string | null;
}

export const useAffiliateStatsStore = defineStore("affiliateStats", {
  state: (): AffiliateStatsState => ({
    itemsByAffiliate: {},
    loading: false,
    error: null,
  }),
  actions: {
    async loadStats() {
      this.loading = true;
      this.error = null;
      try {
        const rows = await fetchAffiliateStats();
        const map: Record<string, AffiliateStats> = {};
        for (const row of rows) {
          map[row.affiliate_id] = row;
        }
        this.itemsByAffiliate = map;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar métricas de afiliados.";
      } finally {
        this.loading = false;
      }
    },
  },
});

