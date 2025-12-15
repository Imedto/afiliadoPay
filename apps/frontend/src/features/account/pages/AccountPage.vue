<script setup lang="ts">
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { useAuthStore } from "../../auth/store/useAuthStore";

const authStore = useAuthStore();

function onSelectTenant(tenantId: string) {
  authStore.setActiveTenant(tenantId);
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Conta</h1>
        <p class="subtitle">
          Informações da sua conta e seleção do negócio ativo.
        </p>
      </div>
    </div>

    <BaseCard v-if="authStore.user">
      <template #default>
        <h2 class="section-title">Usuário</h2>
        <div class="user-info">
          <div>
            <div class="label">Email</div>
            <div class="value">{{ authStore.user.email }}</div>
          </div>
          <div>
            <div class="label">ID</div>
            <div class="value id">{{ authStore.user.id }}</div>
          </div>
        </div>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="section-title">Negócios (tenants)</h2>
        <p class="help">
          Cada tenant representa um negócio/marca diferente. O tenant ativo define quais
          produtos, vendas e afiliados você está gerenciando no momento.
        </p>

        <table v-if="authStore.tenants.length" class="table">
          <thead>
            <tr>
              <th>ID do tenant</th>
              <th>Papel</th>
              <th>Ativo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in authStore.tenants" :key="t.tenant_id">
              <td class="id">{{ t.tenant_id }}</td>
              <td>{{ t.role }}</td>
              <td>
                <span v-if="authStore.activeTenantId === t.tenant_id">Sim</span>
                <span v-else>Não</span>
              </td>
              <td>
                <BaseButton
                  v-if="authStore.activeTenantId !== t.tenant_id"
                  variant="secondary"
                  @click="onSelectTenant(t.tenant_id)"
                >
                  Tornar ativo
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhum tenant encontrado para este usuário.
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

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.user-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--rp-color-text-soft);
}

.value {
  font-size: 0.9rem;
  margin-top: 0.15rem;
}

.value.id,
td.id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 0.8rem;
}

.help {
  font-size: 0.85rem;
  color: var(--rp-color-text-muted);
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

