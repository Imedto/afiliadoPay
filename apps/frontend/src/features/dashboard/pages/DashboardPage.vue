<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import BaseCard from "../../../components/ui/BaseCard.vue";
import StatCard from "../../../components/ui/StatCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { fetchDashboardStats, type DashboardStats } from "../api/dashboardApi";

const router = useRouter();

const loading = ref(false);
const error = ref<string | null>(null);
const stats = ref<DashboardStats | null>(null);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    stats.value = await fetchDashboardStats();
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro desconhecido ao carregar painel.";
  } finally {
    loading.value = false;
  }
}

function goToNewProduct() {
  router.push({ name: "products" });
}

onMounted(() => {
  load();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Visão geral</h1>
        <p class="subtitle">Resumo rápido de produtos e vendas.</p>
      </div>
      <BaseButton variant="primary" @click="goToNewProduct">
        Novo produto
      </BaseButton>
    </div>

    <BaseCard>
      <template #default>
        <div v-if="error" class="error">
          {{ error }}
        </div>

        <div v-else class="stats-grid">
          <StatCard
            label="Produtos"
            :value="stats?.productsCount ?? (loading ? '...' : 0)"
            hint="Produtos cadastrados neste tenant"
          />
          <StatCard
            label="Vendas"
            :value="stats?.salesCount ?? (loading ? '...' : 0)"
            hint="Total de vendas registradas"
          />
          <StatCard
            label="Vendas pagas"
            :value="stats?.paidSalesCount ?? (loading ? '...' : 0)"
            hint="Vendas confirmadas"
          />
          <StatCard
            label="Faturamento líquido"
            :value="stats ? stats.totalRevenue.toFixed(2) : loading ? '...' : '0.00'"
            hint="Soma de valor líquido de vendas pagas"
          />
          <StatCard
            label="Afiliados ativos"
            :value="stats?.affiliatesCount ?? (loading ? '...' : 0)"
            hint="Afiliados cadastrados e ativos"
          />
          <StatCard
            label="Memberships ativas"
            :value="stats?.activeMembershipsCount ?? (loading ? '...' : 0)"
            hint="Acessos ativos na área de membros"
          />
        </div>
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
  font-size: 1.4rem;
  font-weight: 700;
}

.subtitle {
  margin-top: 0.15rem;
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.error {
  color: var(--rp-color-danger);
  font-size: 0.9rem;
}
</style>
