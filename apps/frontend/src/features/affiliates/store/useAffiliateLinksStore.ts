import { defineStore } from "pinia";
import {
  createAffiliateLink,
  fetchAffiliateLinksByAffiliate,
  type AffiliateLink,
  type CreateAffiliateLinkInput,
} from "../api/affiliateLinksApi";

interface AffiliateLinksState {
  itemsByAffiliate: Record<string, AffiliateLink[]>;
  loading: boolean;
  error: string | null;
}

export const useAffiliateLinksStore = defineStore("affiliateLinks", {
  state: (): AffiliateLinksState => ({
    itemsByAffiliate: {},
    loading: false,
    error: null,
  }),
  actions: {
    async loadForAffiliate(affiliateId: string) {
      this.loading = true;
      this.error = null;
      try {
        const links = await fetchAffiliateLinksByAffiliate(affiliateId);
        this.itemsByAffiliate[affiliateId] = links;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar links de afiliado.";
      } finally {
        this.loading = false;
      }
    },
    async addLink(input: CreateAffiliateLinkInput) {
      this.loading = true;
      this.error = null;
      try {
        const link = await createAffiliateLink(input);
        const list = this.itemsByAffiliate[input.affiliateId] ?? [];
        this.itemsByAffiliate[input.affiliateId] = [link, ...list];
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao criar link de afiliado.";
      } finally {
        this.loading = false;
      }
    },
  },
});

