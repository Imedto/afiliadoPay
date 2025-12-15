<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import StatCard from "../../../components/ui/StatCard.vue";
import { env } from "../../../lib/env";
import {
  fetchMyAffiliateLinks,
  fetchMyAffiliateSales,
  fetchMyAffiliateStats,
  fetchMyAffiliateCommissions,
  type MyAffiliateSale,
  type MyAffiliateStats,
  type MyAffiliateCommission,
  type AffiliatePeriodFilters,
} from "../api/affiliatePortalApi";

const loading = ref(false);
const error = ref<string | null>(null);

const stats = ref<MyAffiliateStats[]>([]);
const sales = ref<MyAffiliateSale[]>([]);
const links = ref<Record<string, string[]>>({});
const commissions = ref<MyAffiliateCommission[]>([]);
const affiliateRedirectBaseUrl = env.affiliateRedirectBaseUrl;

const selectedAffiliateId = ref<string | null>(null);
const startDate = ref("");
const endDate = ref("");

const totalClicks = computed(() =>
  stats.value.reduce((sum, s) => sum + (s.total_clicks ?? 0), 0),
);

const totalPaidSales = computed(() =>
  stats.value.reduce((sum, s) => sum + (s.total_paid_sales ?? 0), 0),
);

const totalCommission = computed(() =>
  commissions.value.reduce((sum, c) => sum + Number(c.amount ?? 0), 0),
);

const currentAffiliate = computed(() => {
  if (!stats.value.length) return null;
  const id = selectedAffiliateId.value ?? stats.value[0]?.affiliate_id;
  return stats.value.find((s) => s.affiliate_id === id) ?? stats.value[0];
});

const salesForCurrent = computed(() => {
  if (!currentAffiliate.value) return [] as MyAffiliateSale[];
  return sales.value.filter(
    (s) => s.affiliate_id === currentAffiliate.value?.affiliate_id,
  );
});

const commissionsForCurrent = computed(() => {
  if (!currentAffiliate.value) return [] as MyAffiliateCommission[];
  return commissions.value.filter(
    (c) => c.affiliate_id === currentAffiliate.value?.affiliate_id,
  );
});

async function load() {
  loading.value = true;
  error.value = null;

  try {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 29);

    if (!startDate.value) {
      startDate.value = past.toISOString().slice(0, 10);
    }
    if (!endDate.value) {
      endDate.value = today.toISOString().slice(0, 10);
    }

    const filters: AffiliatePeriodFilters = {
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
    };

    const [statsResult, salesResult, commissionsResult] = await Promise.all([
      fetchMyAffiliateStats(),
      fetchMyAffiliateSales(filters),
      fetchMyAffiliateCommissions(filters),
    ]);

    stats.value = statsResult;
    sales.value = salesResult;
    commissions.value = commissionsResult;

    if (statsResult.length && !selectedAffiliateId.value) {
      selectedAffiliateId.value = statsResult[0].affiliate_id;
    }

    const affiliateIds = statsResult.map((s) => s.affiliate_id);
    if (affiliateIds.length) {
      const linksResult = await fetchMyAffiliateLinks(affiliateIds);
      const grouped: Record<string, string[]> = {};
      for (const link of linksResult) {
        if (!grouped[link.affiliate_id]) {
          grouped[link.affiliate_id] = [];
        }
        grouped[link.affiliate_id].push(link.slug);
      }
      links.value = grouped;
    }
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : "Erro desconhecido ao carregar painel do afiliado.";
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
        <h1 class="title">Meu painel de afiliado</h1>
        <p class="subtitle">
          Acompanhe cliques, vendas e comissões dos seus links.
        </p>
      </div>
    </div>

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <p v-else-if="loading" class="loading">
      Carregando dados do afiliado...
    </p>

    <p v-else-if="!stats.length" class="empty">
      Nenhum vínculo de afiliado encontrado para este usuário.
      Verifique com o produtor se seu e-mail está corretamente cadastrado como afiliado.
    </p>

    <template v-else>
      <BaseCard>
        <template #default>
          <form class="filters" @submit.prevent="load">
            <label class="field">
              <span>Período inicial</span>
              <input v-model="startDate" type="date" />
            </label>
            <label class="field">
              <span>Período final</span>
              <input v-model="endDate" type="date" />
            </label>
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="loading"
            >
              Atualizar período
            </BaseButton>
          </form>
        </template>
      </BaseCard>

      <BaseCard>
        <template #default>
          <div class="header-row">
            <div class="stats-grid">
              <StatCard
                label="Cliques em todos os links"
                :value="totalClicks.toString()"
                hint="Soma de cliques registrados"
              />
              <StatCard
                label="Vendas pagas"
                :value="totalPaidSales.toString()"
                hint="Vendas confirmadas"
              />
              <StatCard
                label="Comissões acumuladas"
                :value="totalCommission.toFixed(2)"
                hint="Somatório em todas as contas"
              />
            </div>
            <div
              v-if="stats.length > 1"
              class="affiliate-selector"
            >
              <label>
                <span>Selecionar afiliado</span>
                <select v-model="selectedAffiliateId">
                  <option
                    v-for="s in stats"
                    :key="s.affiliate_id"
                    :value="s.affiliate_id"
                  >
                    {{ s.name }} ({{ s.email || "sem e-mail" }})
                  </option>
                </select>
              </label>
            </div>
          </div>
        </template>
      </BaseCard>

      <BaseCard v-if="currentAffiliate">
        <template #default>
          <div class="affiliate-header">
            <div>
              <h2 class="affiliate-name">
                {{ currentAffiliate.name }}
              </h2>
              <p class="affiliate-meta">
                {{ currentAffiliate.email || "sem e-mail" }}
              </p>
            </div>
            <div class="links-info">
              <p class="links-title">
                Links de divulgação
              </p>
              <div
                v-if="links[currentAffiliate.affiliate_id]?.length"
                class="links-list"
              >
                <div
                  v-for="slug in links[currentAffiliate.affiliate_id]"
                  :key="slug"
                  class="link-row"
                >
                  <code class="slug-pill">
                    {{ slug }}
                  </code>
                  <input
                    class="link-input"
                    :value="`${affiliateRedirectBaseUrl}/${slug}`"
                    readonly
                  />
                </div>
              </div>
              <p v-else class="empty">
                Nenhum link gerado ainda. Peça ao produtor para criar ou compartilhar
                seus links de divulgação.
              </p>
            </div>
          </div>
        </template>
      </BaseCard>

      <BaseCard>
        <template #default>
          <h2 class="list-title">
            Meu extrato de comissões
          </h2>
          <table v-if="commissionsForCurrent.length" class="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Venda</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Pago em</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in commissionsForCurrent" :key="c.commission_id">
                <td>{{ new Date(c.created_at).toLocaleString() }}</td>
                <td>{{ c.sale_id }}</td>
                <td>R$ {{ Number(c.amount ?? 0).toFixed(2) }}</td>
                <td>{{ c.status }}</td>
                <td>
                  <span v-if="c.paid_at">
                    {{ new Date(c.paid_at).toLocaleString() }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty">
            Nenhuma comissão registrada ainda. Quando uma venda sua gerar comissão,
            ela aparecerá aqui.
          </p>
        </template>
      </BaseCard>

      <BaseCard>
        <template #default>
          <h2 class="list-title">
            Minhas vendas como afiliado
          </h2>
          <table v-if="salesForCurrent.length" class="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Código</th>
                <th>Status</th>
                <th>Valor bruto</th>
                <th>Minha comissão</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in salesForCurrent" :key="s.sale_id">
                <td>{{ new Date(s.created_at).toLocaleString() }}</td>
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
            Nenhuma venda registrada ainda para este afiliado. Quando uma venda for
            confirmada, ela aparecerá aqui.
          </p>
        </template>
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: linear-gradient(135deg, #f5f9ff, #f9fffb);
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

.filters {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input[type="date"] {
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.45rem 0.65rem;
  font-size: 0.9rem;
  background: var(--rp-color-bg-soft);
  color: var(--rp-color-text-main);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.affiliate-selector label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.affiliate-selector select {
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.45rem 0.65rem;
  font-size: 0.85rem;
  background: #ffffff;
  color: var(--rp-color-text-main);
}

.affiliate-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
}

.affiliate-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.affiliate-meta {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.links-info {
  text-align: right;
}

.links-title {
  font-size: 0.9rem;
  font-weight: 600;
}

.links-list {
  margin-top: 0.3rem;
}

.slug-pill {
  display: inline-block;
  margin: 0 0.25rem 0.25rem 0;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.75rem;
}

.link-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.3rem;
}

.link-input {
  flex: 1;
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.3rem 0.45rem;
  font-size: 0.8rem;
  background: #ffffff;
  color: var(--rp-color-text-main);
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
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
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

.loading {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.empty {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

@media (max-width: 900px) {
  .page {
    padding: 1rem;
  }

  .affiliate-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .links-info {
    text-align: left;
  }

  .header-row {
    flex-direction: column;
  }
}
</style>
