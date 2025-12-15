<script setup lang="ts">
import { onMounted } from "vue";
import BaseCard from "../../../components/ui/BaseCard.vue";
import StatCard from "../../../components/ui/StatCard.vue";
import { useCommissionsStore } from "../store/useCommissionsStore";

const commissionsStore = useCommissionsStore();

onMounted(() => {
  commissionsStore.loadCommissions();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Comissões</h1>
        <p class="subtitle">
          Visão geral das comissões geradas por vendas.
        </p>
      </div>
    </div>

    <BaseCard>
      <template #default>
        <div v-if="commissionsStore.summary" class="stats-grid">
          <StatCard
            label="Total"
            :value="commissionsStore.summary.total.toFixed(2)"
            hint="Todas as comissões"
          />
          <StatCard
            label="Pendentes"
            :value="commissionsStore.summary.pending.toFixed(2)"
            hint="Aguardando aprovação"
          />
          <StatCard
            label="Aprovadas"
            :value="commissionsStore.summary.approved.toFixed(2)"
            hint="Liberadas para pagamento"
          />
          <StatCard
            label="Pagas"
            :value="commissionsStore.summary.paid.toFixed(2)"
            hint="Comissões já pagas"
          />
        </div>
        <p v-else-if="commissionsStore.loading">
          Calculando resumo...
        </p>
        <p v-else>
          Nenhuma comissão encontrada.
        </p>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">Lista de comissões</h2>

        <p v-if="commissionsStore.error" class="error">
          {{ commissionsStore.error }}
        </p>

        <table v-if="commissionsStore.items.length" class="table">
          <thead>
            <tr>
              <th>Venda</th>
              <th>Afiliado</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Criada em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in commissionsStore.items" :key="c.id">
              <td>{{ c.sale_id }}</td>
              <td>{{ c.affiliate_id }}</td>
              <td>{{ c.amount.toFixed(2) }}</td>
              <td>{{ c.status }}</td>
              <td>{{ new Date(c.created_at).toLocaleString() }}</td>
              <td class="actions-cell">
                <button
                  type="button"
                  class="link-button"
                  :disabled="commissionsStore.loading || c.status === 'paid'"
                  @click="commissionsStore.changeStatus(c.id, 'approved')"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  class="link-button"
                  :disabled="commissionsStore.loading || c.status === 'paid'"
                  @click="commissionsStore.changeStatus(c.id, 'paid')"
                >
                  Marcar como paga
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhuma comissão encontrada.
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

.actions-cell {
  white-space: nowrap;
}

.link-button {
  background: transparent;
  border: none;
  color: var(--rp-color-primary);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0 0.25rem;
}
</style>
