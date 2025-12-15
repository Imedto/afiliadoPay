<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BaseCard from "../../../components/ui/BaseCard.vue";
import StatCard from "../../../components/ui/StatCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { useSalesReportsStore } from "../store/useSalesReportsStore";
import { useProductsStore } from "../../products/store/useProductsStore";
import { useAffiliatesStore } from "../../affiliates/store/useAffiliatesStore";

const reportsStore = useSalesReportsStore();
const productsStore = useProductsStore();
const affiliatesStore = useAffiliatesStore();

const startDate = ref("");
const endDate = ref("");
const productId = ref<string | "">("");
const affiliateId = ref<string | "">("");

onMounted(() => {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 6);

  startDate.value = past.toISOString().slice(0, 10);
  endDate.value = today.toISOString().slice(0, 10);

  productsStore.loadProducts();
  affiliatesStore.loadAffiliates();

  reload();
});

function reload() {
  reportsStore.load({
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
    productId: productId.value || undefined,
    affiliateId: affiliateId.value || undefined,
  });
}

const totalSales = computed(() =>
  reportsStore.dailyItems.reduce((sum, row) => sum + (row.sales_count ?? 0), 0),
);

const totalBruto = computed(() =>
  reportsStore.dailyItems.reduce(
    (sum, row) => sum + Number(row.total_bruto ?? 0),
    0,
  ),
);

const totalLiquido = computed(() =>
  reportsStore.dailyItems.reduce(
    (sum, row) => sum + Number(row.total_liquido ?? 0),
    0,
  ),
);

function formatStatus(status: number): string {
  if (status === 0) return "Pendente";
  if (status === 3) return "Pago";
  if (status === 7) return "Cancelado";
  return String(status);
}

function exportCsv() {
  const lines: string[] = [];
  lines.push("tipo,day,product_id,affiliate_id,product_code,product_name,status,sales_count,total_bruto,total_liquido");

  for (const row of reportsStore.dailyItems) {
    lines.push(
      [
        "daily",
        row.day,
        row.product_id ?? "",
        row.affiliate_id ?? "",
        "",
        "",
        formatStatus(row.status),
        row.sales_count,
        Number(row.total_bruto ?? 0).toFixed(2),
        Number(row.total_liquido ?? 0).toFixed(2),
      ].join(","),
    );
  }

  for (const row of reportsStore.productItems) {
    lines.push(
      [
        "product",
        "",
        row.product_id,
        "",
        row.product_code,
        `"${row.product_name.replace(/"/g, '""')}"`,
        "Pago",
        row.sales_count,
        Number(row.total_bruto ?? 0).toFixed(2),
        Number(row.total_liquido ?? 0).toFixed(2),
      ].join(","),
    );
  }

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const start = reportsStore.filters.startDate ?? "";
  const end = reportsStore.filters.endDate ?? "";
  link.download = `relatorio-vendas-${start || "inicio"}-${end || "fim"}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Relatórios de vendas</h1>
        <p class="subtitle">
          Resumo diário de vendas por período, para análise de performance.
        </p>
      </div>
    </div>

    <BaseCard>
      <template #default>
        <form class="filters" @submit.prevent="reload">
          <label class="field">
            <span>Data inicial</span>
            <input v-model="startDate" type="date" />
          </label>
          <label class="field">
            <span>Data final</span>
            <input v-model="endDate" type="date" />
          </label>

          <label class="field">
            <span>Produto</span>
            <select v-model="productId">
              <option value="">Todos</option>
              <option
                v-for="p in productsStore.items"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }} ({{ p.code }})
              </option>
            </select>
          </label>

          <label class="field">
            <span>Afiliado</span>
            <select v-model="affiliateId">
              <option value="">Todos</option>
              <option
                v-for="a in affiliatesStore.items"
                :key="a.id"
                :value="a.id"
              >
                {{ a.name }} ({{ a.email || "sem e-mail" }})
              </option>
            </select>
          </label>

          <div class="actions">
            <BaseButton
              type="submit"
              variant="primary"
              :disabled="reportsStore.loading"
            >
              {{ reportsStore.loading ? "Carregando..." : "Aplicar filtros" }}
            </BaseButton>
            <BaseButton
              type="button"
              variant="secondary"
              :disabled="reportsStore.loading || (!reportsStore.dailyItems.length && !reportsStore.productItems.length)"
              @click="exportCsv"
            >
              Exportar CSV
            </BaseButton>
          </div>
        </form>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <div class="stats-grid">
          <StatCard
            label="Total de vendas"
            :value="totalSales.toString()"
            hint="Quantidade de vendas no período"
          />
          <StatCard
            label="Faturamento bruto"
            :value="totalBruto.toFixed(2)"
            hint="Soma de valor bruto"
          />
          <StatCard
            label="Faturamento líquido"
            :value="totalLiquido.toFixed(2)"
            hint="Soma de valor líquido"
          />
        </div>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">
          Vendas por dia
        </h2>
        <p v-if="reportsStore.error" class="error">
          {{ reportsStore.error }}
        </p>
        <table v-if="reportsStore.dailyItems.length" class="table">
          <thead>
            <tr>
              <th>Dia</th>
              <th>Status</th>
              <th>Qtd. vendas</th>
              <th>Valor bruto</th>
              <th>Valor líquido</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in reportsStore.dailyItems"
              :key="`${row.day}-${row.status}`"
            >
              <td>{{ row.day }}</td>
              <td>{{ formatStatus(row.status) }}</td>
              <td>{{ row.sales_count }}</td>
              <td>R$ {{ Number(row.total_bruto ?? 0).toFixed(2) }}</td>
              <td>R$ {{ Number(row.total_liquido ?? 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhuma venda encontrada para o período selecionado.
        </p>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">
          Vendas por produto (apenas pagas)
        </h2>
        <table v-if="reportsStore.productItems.length" class="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Código</th>
              <th>Qtd. vendas</th>
              <th>Valor bruto</th>
              <th>Valor líquido</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in reportsStore.productItems"
              :key="row.product_id"
            >
              <td>{{ row.product_name }}</td>
              <td>{{ row.product_code }}</td>
              <td>{{ row.sales_count }}</td>
              <td>R$ {{ Number(row.total_bruto ?? 0).toFixed(2) }}</td>
              <td>R$ {{ Number(row.total_liquido ?? 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhuma venda paga encontrada para o período selecionado.
        </p>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">
          Desempenho por afiliado (acumulado)
        </h2>
        <table v-if="reportsStore.affiliateItems.length" class="table">
          <thead>
            <tr>
              <th>Afiliado</th>
              <th>Email</th>
              <th>Cliques</th>
              <th>Vendas pagas</th>
              <th>Comissão total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="a in reportsStore.affiliateItems"
              :key="a.affiliate_id"
            >
              <td>{{ a.name }}</td>
              <td>{{ a.email || "-" }}</td>
              <td>{{ a.total_clicks ?? 0 }}</td>
              <td>{{ a.total_paid_sales ?? 0 }}</td>
              <td>R$ {{ Number(a.total_commission_amount ?? 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhum afiliado com vendas ainda. Assim que um afiliado gerar vendas com
          comissão, ele aparecerá aqui.
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

select {
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.45rem 0.65rem;
  font-size: 0.9rem;
  background: #ffffff;
  color: var(--rp-color-text-main);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
