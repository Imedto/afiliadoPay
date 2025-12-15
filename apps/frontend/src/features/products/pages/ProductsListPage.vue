<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useProductsStore } from "../store/useProductsStore";
import { useAuthStore } from "../../auth/store/useAuthStore";

const productsStore = useProductsStore();
const authStore = useAuthStore();

const code = ref("");
const name = ref("");
const description = ref("");

onMounted(() => {
  productsStore.loadProducts();
});

async function onCreate() {
  if (!authStore.user) {
    alert("Você precisa estar autenticado.");
    return;
  }
  if (!authStore.activeTenantId) {
    alert("Nenhum tenant ativo encontrado para este usuário.");
    return;
  }

  await productsStore.addProduct({
    tenantId: authStore.activeTenantId,
    createdBy: authStore.user.id,
    code: code.value.trim(),
    name: name.value.trim(),
    description: description.value.trim() || undefined,
  });

  code.value = "";
  name.value = "";
  description.value = "";
}
</script>

<template>
  <div class="page">
    <section class="card">
      <div class="header">
        <h1 class="title">Produtos</h1>
      </div>

      <form class="form" @submit.prevent="onCreate">
        <div class="fields">
          <label class="field">
            <span>Código</span>
            <input v-model="code" required />
          </label>
          <label class="field">
            <span>Nome</span>
            <input v-model="name" required />
          </label>
        </div>

        <label class="field">
          <span>Descrição</span>
          <textarea v-model="description" rows="3" />
        </label>

        <button type="submit" :disabled="productsStore.loading">
          {{ productsStore.loading ? "Salvando..." : "Criar produto" }}
        </button>

        <p v-if="productsStore.error" class="error">
          {{ productsStore.error }}
        </p>
      </form>
    </section>

    <section class="card">
      <h2>Lista</h2>
      <table v-if="productsStore.items.length" class="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Status</th>
            <th>Criado em</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in productsStore.items" :key="product.id">
            <td>{{ product.code }}</td>
            <td>{{ product.name }}</td>
            <td>{{ product.status }}</td>
            <td>{{ new Date(product.created_at).toLocaleString() }}</td>
            <td class="actions-cell">
              <button
                type="button"
                class="link-button"
                @click="$router.push({ name: 'product-checkout-config', params: { productId: product.id } })"
              >
                Configurar checkout
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Nenhum produto cadastrado ainda.</p>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card {
  background: var(--rp-color-surface);
  border-radius: var(--rp-radius-lg);
  padding: 1.5rem 1.75rem;
  box-shadow: var(--rp-shadow-subtle);
  border: 1px solid var(--rp-color-border-subtle);
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
textarea {
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  background: var(--rp-color-bg-soft);
  color: var(--rp-color-text-main);
}

button {
  align-self: flex-start;
  background: linear-gradient(
    to right,
    var(--rp-color-primary-gradient-from),
    var(--rp-color-primary-gradient-to)
  );
  color: #ffffff;
  border: none;
  border-radius: var(--rp-radius-full);
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  font-weight: 600;
}

.error {
  color: var(--rp-color-danger);
  font-size: 0.9rem;
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

.actions-cell {
  white-space: nowrap;
}

.link-button {
  background: transparent;
  border: none;
  color: var(--rp-color-primary);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
}
</style>
