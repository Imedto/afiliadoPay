<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { useAuthStore } from "../../auth/store/useAuthStore";
import {
  fetchCheckoutConfig,
  upsertCheckoutConfig,
  type CheckoutTemplate,
  type AffiliateCommissionType,
} from "../api/productCheckoutApi";
import { useGatewaysStore } from "../../gateways/store/useGatewaysStore";

const route = useRoute();
const authStore = useAuthStore();
const gatewaysStore = useGatewaysStore();

const productId = route.params.productId as string;

const template = ref<CheckoutTemplate>("default");
const primaryColor = ref("#16a34a");
const secondaryColor = ref("#0ea5e9");
const successRedirectUrl = ref("");
const cancelRedirectUrl = ref("");
const selectedGatewayId = ref<string | null>(null);
const affiliateCommissionType = ref<AffiliateCommissionType>("percent");
const affiliateCommissionValue = ref<number | null>(null);

const loading = ref(false);
const error = ref<string | null>(null);
const savedMessage = ref<string | null>(null);

async function loadConfig() {
  if (!authStore.activeTenantId) {
    error.value = "Nenhum tenant ativo encontrado.";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await gatewaysStore.loadGateways();

    const existing = await fetchCheckoutConfig(authStore.activeTenantId, productId);
    if (existing) {
      template.value = existing.template;
      primaryColor.value = existing.primary_color ?? primaryColor.value;
      secondaryColor.value = existing.secondary_color ?? secondaryColor.value;
      successRedirectUrl.value = existing.success_redirect_url ?? "";
      cancelRedirectUrl.value = existing.cancel_redirect_url ?? "";
      selectedGatewayId.value = existing.payment_gateway_id;
      affiliateCommissionType.value =
        existing.affiliate_commission_type ?? "percent";
      affiliateCommissionValue.value =
        existing.affiliate_commission_value ?? null;
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro desconhecido ao carregar configuração.";
  } finally {
    loading.value = false;
  }
}

async function onSave() {
  if (!authStore.activeTenantId) {
    error.value = "Nenhum tenant ativo encontrado.";
    return;
  }

  loading.value = true;
  error.value = null;
  savedMessage.value = null;

  try {
    await upsertCheckoutConfig({
      tenantId: authStore.activeTenantId,
      productId,
      template: template.value,
      paymentGatewayId: selectedGatewayId.value,
      affiliateCommissionType: affiliateCommissionType.value,
      affiliateCommissionValue:
        affiliateCommissionValue.value !== null
          ? Number(affiliateCommissionValue.value)
          : null,
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
      successRedirectUrl: successRedirectUrl.value || undefined,
      cancelRedirectUrl: cancelRedirectUrl.value || undefined,
    });
    savedMessage.value = "Configuração salva com sucesso.";
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro desconhecido ao salvar configuração.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadConfig();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Configuração de checkout</h1>
        <p class="subtitle">
          Defina o modelo e as cores do checkout para este produto.
        </p>
      </div>
    </div>

    <BaseCard>
      <template #default>
        <form class="form" @submit.prevent="onSave">
          <div class="field">
            <span>Gateway de pagamento</span>
            <select v-model="selectedGatewayId" :disabled="loading">
              <option :value="null">Padrão (PagSeguro)</option>
              <option
                v-for="gw in gatewaysStore.items"
                :key="gw.id"
                :value="gw.id"
              >
                {{ gw.name }} ({{ gw.provider }})
              </option>
            </select>
          </div>

          <div class="field">
            <span>Template</span>
            <select v-model="template" :disabled="loading">
              <option value="default">Padrão</option>
              <option value="template_a">Modelo A</option>
              <option value="template_b">Modelo B</option>
              <option value="template_c">Modelo C</option>
            </select>
          </div>

          <div class="fields-inline">
            <label class="field">
              <span>Cor primária</span>
              <input v-model="primaryColor" type="color" />
            </label>

            <label class="field">
              <span>Cor secundária</span>
              <input v-model="secondaryColor" type="color" />
            </label>
          </div>

          <div class="fields-inline">
            <label class="field">
              <span>Tipo de comissão do afiliado</span>
              <select v-model="affiliateCommissionType" :disabled="loading">
                <option value="percent">% do valor do produto</option>
                <option value="fixed">Valor fixo em R$</option>
              </select>
            </label>

            <label class="field">
              <span>Valor da comissão</span>
              <input
                v-model.number="affiliateCommissionValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 50 para 50% ou 100.00"
              />
            </label>
          </div>

          <label class="field">
            <span>URL de sucesso</span>
            <input
              v-model="successRedirectUrl"
              type="url"
              placeholder="https://..."
            />
          </label>

          <label class="field">
            <span>URL de cancelamento</span>
            <input
              v-model="cancelRedirectUrl"
              type="url"
              placeholder="https://..."
            />
          </label>

          <div class="actions">
            <BaseButton type="submit" :variant="'primary'" :disabled="loading">
              {{ loading ? "Salvando..." : "Salvar" }}
            </BaseButton>
            <span v-if="savedMessage" class="saved">
              {{ savedMessage }}
            </span>
          </div>

          <p v-if="error" class="error">
            {{ error }}
          </p>
        </form>
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

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fields-inline {
  display: flex;
  gap: 1rem;
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

.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.saved {
  font-size: 0.85rem;
  color: var(--rp-color-primary-strong);
}

.error {
  color: var(--rp-color-danger);
  font-size: 0.9rem;
}
</style>
