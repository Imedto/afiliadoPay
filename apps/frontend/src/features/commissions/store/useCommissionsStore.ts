import { defineStore } from "pinia";
import {
  fetchCommissions,
  summarizeCommissions,
  type Commission,
  type CommissionsSummary,
} from "../api/commissionsApi";
import { updateCommissionStatus } from "../api/commissionsApi";

interface CommissionsState {
  items: Commission[];
  summary: CommissionsSummary | null;
  loading: boolean;
  error: string | null;
}

export const useCommissionsStore = defineStore("commissions", {
  state: (): CommissionsState => ({
    items: [],
    summary: null,
    loading: false,
    error: null,
  }),
  actions: {
    async loadCommissions() {
      this.loading = true;
      this.error = null;
      try {
        const items = await fetchCommissions();
        this.items = items;
        this.summary = summarizeCommissions(items);
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar comissões.";
      } finally {
        this.loading = false;
      }
    },
    async changeStatus(id: string, status: CommissionStatus) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await updateCommissionStatus(id, status);
        const idx = this.items.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.items[idx] = updated;
        }
        this.summary = summarizeCommissions(this.items);
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao atualizar comissão.";
      } finally {
        this.loading = false;
      }
    },
  },
});
