import { defineStore } from "pinia";
import {
  createAffiliate,
  fetchAffiliates,
  type Affiliate,
  type CreateAffiliateInput,
} from "../api/affiliatesApi";

interface AffiliatesState {
  items: Affiliate[];
  loading: boolean;
  error: string | null;
}

export const useAffiliatesStore = defineStore("affiliates", {
  state: (): AffiliatesState => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async loadAffiliates() {
      this.loading = true;
      this.error = null;
      try {
        this.items = await fetchAffiliates();
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar afiliados.";
      } finally {
        this.loading = false;
      }
    },
    async addAffiliate(input: CreateAffiliateInput) {
      this.loading = true;
      this.error = null;
      try {
        const affiliate = await createAffiliate(input);
        this.items.unshift(affiliate);
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao criar afiliado.";
      } finally {
        this.loading = false;
      }
    },
  },
});

