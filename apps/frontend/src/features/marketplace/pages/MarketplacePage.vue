<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { fetchMarketplaceProducts, type MarketplaceProduct } from "../api/marketplaceApi";

const loading = ref(false);
const error = ref<string | null>(null);
const items = ref<MarketplaceProduct[]>([]);
const query = ref("");

async function load() {
  loading.value = true;
  error.value = null;
  try {
    items.value = await fetchMarketplaceProducts(query.value.trim() || undefined);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro desconhecido ao carregar marketplace.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Marketplace</h1>
        <p class="subtitle">
          Vitrine de produtos públicos para afiliados e clientes.
        </p>
      </div>
      <BaseButton variant="secondary" @click="load">
        Atualizar
      </BaseButton>
    </div>

    <BaseCard>
      <template #default>
        <div class="filters">
          <input
            v-model="query"
            class="search-input"
            type="text"
            placeholder="Buscar por nome do produto"
            @keyup.enter="load"
          />
          <BaseButton variant="primary" @click="load">
            Buscar
          </BaseButton>
        </div>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <div v-if="items.length" class="grid">
          <article v-for="product in items" :key="product.id" class="product-card">
            <h2 class="product-name">
              {{ product.name }}
            </h2>
            <p class="product-description">
              {{ product.description || "Produto sem descrição." }}
            </p>
            <div class="product-footer">
              <span class="product-tag">Código: {{ product.code }}</span>
              <BaseButton variant="secondary">
                Ver detalhes
              </BaseButton>
            </div>
          </article>
        </div>
        <p v-else-if="!loading" class="empty">
          Nenhum produto público encontrado.
        </p>
      </template>
    </BaseCard>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 1.3rem;
  font-weight: 700;
}

.subtitle {
  margin-top: 0.15rem;
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.45rem 0.65rem;
  font-size: 0.9rem;
  background: var(--rp-color-bg-soft);
  color: var(--rp-color-text-main);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.product-card {
  border-radius: var(--rp-radius-md);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 1rem 1rem 0.9rem;
  background: var(--rp-color-surface-soft);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
}

.product-description {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.product-footer {
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-tag {
  font-size: 0.8rem;
  color: var(--rp-color-text-soft);
}

.error {
  color: var(--rp-color-danger);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.empty {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}
</style>

