<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import StatCard from "../../../components/ui/StatCard.vue";
import { useAffiliatesStore } from "../store/useAffiliatesStore";
import { useAffiliateSalesStore } from "../store/useAffiliateSalesStore";
import { useAffiliateStatsStore } from "../store/useAffiliateStatsStore";

const route = useRoute();
const router = useRouter();

const affiliateId = route.params.affiliateId as string;

const affiliatesStore = useAffiliatesStore();
const salesStore = useAffiliateSalesStore();
const statsStore = useAffiliateStatsStore();

onMounted(async () => {
  if (!affiliatesStore.items.length) {
    await affiliatesStore.loadAffiliates();
  }
  if (!Object.keys(statsStore.itemsByAffiliate).length) {
    await statsStore.loadStats();
  }
  await salesStore.loadForAffiliate(affiliateId);
});

const affiliate = computed(() =>
  affiliatesStore.items.find((a) => a.id === affiliateId) ?? null,
);

const stats = computed(() => statsStore.itemsByAffiliate[affiliateId] ?? null);

const sales = computed(
  () => salesStore.itemsByAffiliate[affiliateId] ?? [],
);

const totalCommission = computed(() =>
  sales.value.reduce(
    (sum, s) => sum + (s.comissao_afiliado ? Number(s.comissao_afiliado) : 0),
    0,
  ),
);

const totalPaidSales = computed(() =>
  sales.value.filter((s) => s.status === 3).length,
);

const totalRevenue = computed(() =>
  sales.value.reduce((sum, s) => sum + Number(s.valor_bruto ?? 0), 0),
);

function goBack() {
  router.push({ name: "affiliates" });
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">
          Detalhes do afiliado
        </h1>
        <p class="subtitle">
          Visão consolidada das vendas e comissões deste afiliado.
        </p>
      </div>
      <BaseButton variant="ghost" @click="goBack">
        Voltar para lista
      </BaseButton>
    </div>

    <BaseCard>
      <template #default>
        <div v-if="affiliate" class="affiliate-header">
          <div>
            <p class="name">
              {{ affiliate.name }}
            </p>
            <p class="meta">
              {{ affiliate.email || "sem e-mail" }}
            </p>
            <p class="meta">
              Documento: {{ affiliate.document || "-" }}
            </p>
            <p class="meta">
              Status: {{ affiliate.status }}
            </p>
          </div>
          <div class="summary">
            <p class="meta">
              Criado em:
              {{ new Date(affiliate.created_at).toLocaleString() }}
            </p>
          </div>
        </div>
        <p v-else class="empty">
          Afiliado não encontrado.
        </p>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <div class="stats-grid" v-if="stats || sales.length">
          <StatCard
            label="Cliques"
            :value="(stats?.total_clicks ?? 0).toString()"
            hint="Total de acessos pelos links"
          />
          <StatCard
            label="Vendas pagas"
            :value="(stats?.total_paid_sales ?? totalPaidSales).toString()"
            hint="Vendas confirmadas"
          />
          <StatCard
            label="Faturamento gerado"
            :value="totalRevenue.toFixed(2)"
            hint="Soma de valor bruto"
          />
          <StatCard
            label="Comissões deste afiliado"
            :value="totalCommission.toFixed(2)"
            hint="Somente deste afiliado"
          />
        </div>
        <p v-else class="empty">
          Ainda não há dados de desempenho para este afiliado.
        </p>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">
          Vendas deste afiliado
        </h2>
        <p v-if="salesStore.error" class="error">
          {{ salesStore.error }}
        </p>
        <table v-if="sales.length" class="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Produto</th>
              <th>Código</th>
              <th>Status</th>
              <th>Valor bruto</th>
              <th>Comissão</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sales" :key="s.sale_id">
              <td>
                {{ new Date(s.created_at).toLocaleString() }}
              </td>
              <td>{{ s.product_name }}</td>
              <td>{{ s.product_code }}</td>
              <td>{{ s.status }}</td>
              <td>R$ {{ Number(s.valor_bruto ?? 0).toFixed(2) }}</td>
              <td>
                <span v-if="s.comissao_afiliado !== null">
                  R$ {{ Number(s.comissao_afiliado).toFixed(2) }}
                </span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhuma venda encontrada para este afiliado.
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

.affiliate-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
}

.name {
  font-size: 1.1rem;
  font-weight: 600;
}

.meta {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.summary {
  text-align: right;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.list-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table th,
.table td {
  border-bottom: 1px solid rgba(15, 23, 42, 0.7);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.table th {
  background-color: var(--rp-color-bg-soft);
}

.error {
  color: var(--rp-color-danger);
  font-size: 0.9rem;
}

.empty {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}
</style>

