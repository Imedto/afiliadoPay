import { defineStore } from "pinia";
import { fetchProducts, createProduct, type Product, type CreateProductInput } from "../api/productsApi";

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

export const useProductsStore = defineStore("products", {
  state: (): ProductsState => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async loadProducts() {
      this.loading = true;
      this.error = null;
      try {
        this.items = await fetchProducts();
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Erro desconhecido ao carregar produtos.";
      } finally {
        this.loading = false;
      }
    },
    async addProduct(input: CreateProductInput) {
      this.loading = true;
      this.error = null;
      try {
        const product = await createProduct(input);
        this.items.unshift(product);
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Erro desconhecido ao criar produto.";
      } finally {
        this.loading = false;
      }
    },
  },
});

