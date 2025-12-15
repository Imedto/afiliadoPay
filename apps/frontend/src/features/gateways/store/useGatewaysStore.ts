import { defineStore } from "pinia";
import {
  createGateway,
  fetchGateways,
  type CreateGatewayInput,
  type PaymentGateway,
} from "../api/gatewaysApi";

interface GatewaysState {
  items: PaymentGateway[];
  loading: boolean;
  error: string | null;
}

export const useGatewaysStore = defineStore("gateways", {
  state: (): GatewaysState => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async loadGateways() {
      this.loading = true;
      this.error = null;
      try {
        this.items = await fetchGateways();
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar gateways.";
      } finally {
        this.loading = false;
      }
    },
    async addGateway(input: CreateGatewayInput) {
      this.loading = true;
      this.error = null;
      try {
        const gw = await createGateway(input);
        this.items.unshift(gw);
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao criar gateway.";
      } finally {
        this.loading = false;
      }
    },
  },
});

