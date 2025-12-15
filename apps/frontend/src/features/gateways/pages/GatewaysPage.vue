<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { useGatewaysStore } from "../store/useGatewaysStore";
import { useAuthStore } from "../../auth/store/useAuthStore";
import type { PaymentProvider } from "../api/gatewaysApi";

const gatewaysStore = useGatewaysStore();
const authStore = useAuthStore();

const provider = ref<PaymentProvider>("pagseguro");
const name = ref("");

onMounted(() => {
  gatewaysStore.loadGateways();
});

async function onCreate() {
  if (!authStore.user || !authStore.activeTenantId) {
    alert("Nenhum tenant ativo encontrado para este usuário.");
    return;
  }

  await gatewaysStore.addGateway({
    tenantId: authStore.activeTenantId,
    provider: provider.value,
    name: name.value.trim(),
  });

  name.value = "";
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Gateways de pagamento</h1>
        <p class="subtitle">
          Cadastre as operadoras que serão usadas nos checkouts.
        </p>
      </div>
    </div>

    <BaseCard>
      <template #default>
        <form class="form" @submit.prevent="onCreate">
          <div class="fields">
            <label class="field">
              <span>Gateway</span>
              <select v-model="provider">
                <option value="pagseguro">PagSeguro</option>
                <option value="pagarme">Pagar.me</option>
                <option value="cielo">Cielo</option>
                <option value="asaas">Asaas</option>
                <option value="wirecard">Wirecard</option>
              </select>
            </label>
            <label class="field">
              <span>Nome interno</span>
              <input
                v-model="name"
                required
                placeholder="Ex.: PagSeguro principal"
              />
            </label>
          </div>

          <p class="hint">
            Observação: as chaves/API keys de cada gateway devem ser guardadas em
            ambiente seguro (Supabase secrets ou outro cofre), não diretamente no
            banco de dados.
          </p>

          <BaseButton
            type="submit"
            :variant="'primary'"
            :disabled="gatewaysStore.loading"
          >
            {{ gatewaysStore.loading ? "Salvando..." : "Cadastrar gateway" }}
          </BaseButton>

          <p v-if="gatewaysStore.error" class="error">
            {{ gatewaysStore.error }}
          </p>
        </form>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">Gateways cadastrados</h2>
        <table v-if="gatewaysStore.items.length" class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Gateway</th>
              <th>Ativo</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="gw in gatewaysStore.items" :key="gw.id">
              <td>{{ gw.name }}</td>
              <td>{{ gw.provider }}</td>
              <td>{{ gw.is_active ? "Sim" : "Não" }}</td>
              <td>{{ new Date(gw.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhum gateway cadastrado ainda.
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

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fields {
  display: flex;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

input,
select {
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.45rem 0.65rem;
  font-size: 0.9rem;
  background: var(--rp-color-bg-soft);
  color: var(--rp-color-text-main);
}

.hint {
  font-size: 0.8rem;
  color: var(--rp-color-text-muted);
}

.error {
  margin-top: 0.25rem;
  color: var(--rp-color-danger);
  font-size: 0.9rem;
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

.empty {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}
</style>

