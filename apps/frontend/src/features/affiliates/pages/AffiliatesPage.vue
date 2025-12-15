<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import BaseBadge from "../../../components/ui/BaseBadge.vue";
import { useAffiliatesStore } from "../store/useAffiliatesStore";
import { useAffiliateLinksStore } from "../store/useAffiliateLinksStore";
import { useAffiliateStatsStore } from "../store/useAffiliateStatsStore";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useProductsStore } from "../../products/store/useProductsStore";

const affiliatesStore = useAffiliatesStore();
const authStore = useAuthStore();
const linksStore = useAffiliateLinksStore();
const statsStore = useAffiliateStatsStore();
const productsStore = useProductsStore();
const router = useRouter();

const name = ref("");
const email = ref("");
const document = ref("");
const selectedAffiliateId = ref<string | null>(null);
const selectedProductId = ref<string | null>(null);
const linkSlug = ref("");
const publicAffiliateBaseUrl = computed(() => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/functions/v1/affiliate-redirect`;
});

onMounted(() => {
  affiliatesStore.loadAffiliates();
  productsStore.loadProducts();
  statsStore.loadStats();
});

async function onCreate() {
  if (!authStore.user || !authStore.activeTenantId) {
    alert("Nenhum tenant ativo encontrado para este usuário.");
    return;
  }

  await affiliatesStore.addAffiliate({
    tenantId: authStore.activeTenantId,
    name: name.value.trim(),
    email: email.value.trim() || undefined,
    document: document.value.trim() || undefined,
  });

  name.value = "";
  email.value = "";
  document.value = "";
}

const selectedAffiliate = computed(() =>
  affiliatesStore.items.find((a) => a.id === selectedAffiliateId.value) ?? null,
);

const selectedAffiliateLinks = computed(() => {
  if (!selectedAffiliateId.value) return [];
  return linksStore.itemsByAffiliate[selectedAffiliateId.value] ?? [];
});

const selectedAffiliateStats = computed(() => {
  if (!selectedAffiliateId.value) return null;
  return statsStore.itemsByAffiliate[selectedAffiliateId.value] ?? null;
});

async function onSelectAffiliate(affiliateId: string) {
  selectedAffiliateId.value =
    selectedAffiliateId.value === affiliateId ? null : affiliateId;
  if (selectedAffiliateId.value) {
    await linksStore.loadForAffiliate(selectedAffiliateId.value);
  }
}

function goToAffiliateDetail(affiliateId: string) {
  router.push({ name: "affiliate-detail", params: { affiliateId } });
}

async function onCreateLink() {
  if (!authStore.activeTenantId || !selectedAffiliateId.value || !selectedProductId.value) {
    alert("Selecione um afiliado, um produto e informe o slug.");
    return;
  }

  const slugTrimmed = linkSlug.value.trim();
  if (!slugTrimmed) {
    alert("Informe um slug para o link de afiliado.");
    return;
  }

  await linksStore.addLink({
    tenantId: authStore.activeTenantId,
    affiliateId: selectedAffiliateId.value,
    productId: selectedProductId.value,
    slug: slugTrimmed,
  });

  linkSlug.value = "";
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Afiliados</h1>
        <p class="subtitle">
          Cadastre e gerencie afiliados ligados ao seu negócio.
        </p>
      </div>
    </div>

    <BaseCard>
      <template #default>
        <form class="form" @submit.prevent="onCreate">
          <div class="fields">
            <label class="field">
              <span>Nome</span>
              <input v-model="name" required />
            </label>
            <label class="field">
              <span>Email</span>
              <input v-model="email" type="email" />
            </label>
          </div>

          <label class="field">
            <span>Documento (CPF/CNPJ)</span>
            <input v-model="document" />
          </label>

          <BaseButton
            type="submit"
            :variant="'primary'"
            :disabled="affiliatesStore.loading"
          >
            {{ affiliatesStore.loading ? "Salvando..." : "Cadastrar afiliado" }}
          </BaseButton>

          <p v-if="affiliatesStore.error" class="error">
            {{ affiliatesStore.error }}
          </p>
        </form>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">Lista de afiliados</h2>
        <table v-if="affiliatesStore.items.length" class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Documento</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>Vendas pagas</th>
              <th>Cliques</th>
              <th>Comissão total</th>
              <th>Links</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="affiliate in affiliatesStore.items" :key="affiliate.id">
              <td>{{ affiliate.name }}</td>
              <td>{{ affiliate.email || "-" }}</td>
              <td>{{ affiliate.document || "-" }}</td>
              <td>{{ affiliate.status }}</td>
              <td>{{ new Date(affiliate.created_at).toLocaleString() }}</td>
              <td>
                {{
                  statsStore.itemsByAffiliate[affiliate.id]?.total_paid_sales ??
                  0
                }}
              </td>
              <td>
                {{ statsStore.itemsByAffiliate[affiliate.id]?.total_clicks ?? 0 }}
              </td>
              <td>
                R$
                {{
                  (statsStore.itemsByAffiliate[affiliate.id]
                    ?.total_commission_amount ?? 0).toFixed(2)
                }}
              </td>
              <td>
                <BaseButton
                  size="sm"
                  variant="ghost"
                  @click="onSelectAffiliate(affiliate.id)"
                >
                  {{ selectedAffiliateId === affiliate.id ? "Fechar" : "Links" }}
                </BaseButton>
              </td>
              <td>
                <BaseButton
                  size="sm"
                  variant="ghost"
                  @click="goToAffiliateDetail(affiliate.id)"
                >
                  Ver detalhes
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhum afiliado cadastrado ainda.
        </p>
      </template>
    </BaseCard>

    <BaseCard v-if="selectedAffiliate">
      <template #default>
        <div class="links-header">
          <div>
            <h2 class="list-title">
              Links de afiliado – {{ selectedAffiliate.name }}
            </h2>
            <p class="subtitle">
              Gere links únicos por produto para este afiliado.
            </p>
          </div>
          <BaseBadge>
            {{ selectedAffiliate.email || "sem e-mail" }}
          </BaseBadge>
        </div>

        <form class="form" @submit.prevent="onCreateLink">
          <div class="fields">
            <label class="field">
              <span>Produto</span>
              <select v-model="selectedProductId" required>
                <option value="" disabled>Selecione um produto</option>
                <option
                  v-for="product in productsStore.items"
                  :key="product.id"
                  :value="product.id"
                >
                  {{ product.name }} ({{ product.code }})
                </option>
              </select>
            </label>

            <label class="field">
              <span>Slug do link</span>
              <input
                v-model="linkSlug"
                required
                placeholder="ex: oferta-black-friday"
              />
            </label>
          </div>

          <BaseButton
            type="submit"
            :variant="'primary'"
            :disabled="linksStore.loading"
          >
            {{
              linksStore.loading
                ? "Gerando link..."
                : "Gerar link de afiliado"
            }}
          </BaseButton>

          <p v-if="linksStore.error" class="error">
            {{ linksStore.error }}
          </p>
        </form>

        <h3 class="links-title">Links gerados</h3>
        <table v-if="selectedAffiliateLinks.length" class="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Slug</th>
              <th>URL pública</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="link in selectedAffiliateLinks" :key="link.id">
              <td>
                {{ link.product?.name || "Produto" }}
              </td>
              <td>
                <code>{{ link.slug }}</code>
              </td>
              <td class="url-cell">
                <input
                  :value="`${publicAffiliateBaseUrl}/${link.slug}`"
                  readonly
                />
              </td>
              <td>{{ new Date(link.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhum link criado para este afiliado ainda.
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

input {
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.45rem 0.65rem;
  font-size: 0.9rem;
  background: var(--rp-color-bg-soft);
  color: var(--rp-color-text-main);
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

.links-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.links-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 1.25rem 0 0.5rem;
}

.url-cell input {
  width: 100%;
  font-size: 0.8rem;
}
</style>
