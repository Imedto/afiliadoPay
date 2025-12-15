<script setup lang="ts">
import { computed, ref } from "vue";
import { useSalesStore } from "../store/useSalesStore";

const salesStore = useSalesStore();

const apiKey = ref("");
const inicio = ref("");
const fim = ref("");

const vendas = computed(() => salesStore.data?.dados ?? []);
const info = computed(() => salesStore.data?.info);

async function onSubmit() {
  if (!apiKey.value) {
    alert("Informe a API Key (Authorization).");
    return;
  }

  salesStore.setFilters({
    page: 1,
    inicio: inicio.value || undefined,
    fim: fim.value || undefined,
  });

  await salesStore.loadSales(apiKey.value.trim());
}
</script>

<template>
  <div class="page">
    <h1 class="title">API de Vendas</h1>

    <section class="card">
      <h2>Parâmetros</h2>
      <form @submit.prevent="onSubmit" class="form">
        <label class="field">
          <span>API Key (Authorization)</span>
          <input
            v-model="apiKey"
            type="password"
            autocomplete="off"
            placeholder="Cole aqui a chave da API"
          />
        </label>

        <div class="fields-inline">
          <label class="field">
            <span>Início (YYYY-MM-DD)</span>
            <input v-model="inicio" type="date" />
          </label>

          <label class="field">
            <span>Fim (YYYY-MM-DD)</span>
            <input v-model="fim" type="date" />
          </label>
        </div>

        <button type="submit" :disabled="salesStore.loading">
          {{ salesStore.loading ? "Carregando..." : "Buscar vendas" }}
        </button>

        <p v-if="salesStore.error" class="error">
          {{ salesStore.error }}
        </p>
      </form>
    </section>

    <section v-if="info" class="card">
      <h2>Resumo</h2>
      <ul class="summary">
        <li>Total de registros: {{ info.total_registros }}</li>
        <li>Páginas: {{ info.paginas }}</li>
        <li>Valor vendas: {{ info.valor_vendas }}</li>
        <li>Comissão afiliado: {{ info.comissao_afiliado }}</li>
      </ul>
    </section>

    <section class="card">
      <h2>Vendas</h2>
      <table v-if="vendas.length" class="table">
        <thead>
          <tr>
            <th>Transação</th>
            <th>Produto</th>
            <th>Preço</th>
            <th>Forma Pagamento</th>
            <th>Status</th>
            <th>Comprador</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in vendas" :key="item.venda.transacao">
            <td>{{ item.venda.transacao }}</td>
            <td>{{ item.produto.nome }}</td>
            <td>{{ item.produto.preco }}</td>
            <td>{{ item.venda.formaPagamento }}</td>
            <td>{{ item.venda.statusTransacao }}</td>
            <td>
              {{ item.comprador.nome }}<br />
              <small>{{ item.comprador.email }}</small>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Nenhuma venda carregada.</p>
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
  margin-bottom: 0.25rem;
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

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fields-inline {
  display: flex;
  gap: 1rem;
}

input {
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

button[disabled] {
  opacity: 0.6;
  cursor: default;
}

.error {
  color: var(--rp-color-danger);
  font-size: 0.9rem;
}

.summary {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.5rem 1rem;
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
</style>

