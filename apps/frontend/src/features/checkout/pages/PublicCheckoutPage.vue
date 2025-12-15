<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import BaseButton from "../../../components/ui/BaseButton.vue";
import {
  fetchPublicCheckout,
  type PublicCheckoutResponse,
  createPublicCheckout,
  type CreateCheckoutPayload,
} from "../api/publicCheckoutApi";

const route = useRoute();
const slug = computed(() => route.params.slug as string);
const affiliateId = computed(() => route.query.aff as string | undefined);

const loading = ref(false);
const error = ref<string | null>(null);
const data = ref<PublicCheckoutResponse | null>(null);

const buyerName = ref("");
const buyerEmail = ref("");
const buyerDocument = ref("");
const paymentMethod = ref<CreateCheckoutPayload["payment_method"]>("card");

const creatingCheckout = ref(false);
const createdCheckoutUrl = ref<string | null>(null);

async function load() {
  loading.value = true;
  error.value = null;

  try {
    data.value = await fetchPublicCheckout(slug.value);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro desconhecido ao carregar checkout.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
});

async function onSubmit() {
  if (!data.value) return;

  creatingCheckout.value = true;
  error.value = null;
  createdCheckoutUrl.value = null;

  try {
    const payload: CreateCheckoutPayload = {
      slug: slug.value,
      payment_method: paymentMethod.value,
      affiliate_id: affiliateId.value,
      buyer: {
        name: buyerName.value.trim(),
        email: buyerEmail.value.trim(),
        document: buyerDocument.value.trim(),
      },
    };

    const res = await createPublicCheckout(payload);
    createdCheckoutUrl.value = res.checkout_url;

    // Em produção, provavelmente você irá redirecionar:
    // window.location.href = res.checkout_url;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro desconhecido ao criar checkout.";
  } finally {
    creatingCheckout.value = false;
  }
}
</script>

<template>
  <div class="checkout-page">
    <div class="checkout-card" v-if="data">
      <header class="checkout-header">
        <h1 class="product-name">
          {{ data.product.name }}
        </h1>
        <p class="product-code">
          Código: {{ data.product.code }}
        </p>
      </header>

      <p class="product-description">
        {{ data.product.description || "Este produto ainda não possui descrição." }}
      </p>
      <p v-if="data.plan" class="product-price">
        Valor: R$ {{ Number(data.plan.price ?? 0).toFixed(2) }}
      </p>
      <form class="form" @submit.prevent="onSubmit">
        <div class="checkout-summary">
          <div class="summary-left">
            <p class="summary-title">Dados do comprador</p>

            <label class="field">
              <span>Nome completo</span>
              <input v-model="buyerName" required />
            </label>

            <label class="field">
              <span>Email</span>
              <input v-model="buyerEmail" type="email" required />
            </label>

            <label class="field">
              <span>CPF/CNPJ</span>
              <input v-model="buyerDocument" required />
            </label>

            <p class="summary-title method-title">Forma de pagamento</p>
            <div class="methods">
              <label class="method">
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="card"
                />
                <span>Cartão</span>
              </label>
              <label class="method">
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="boleto"
                />
                <span>Boleto</span>
              </label>
              <label class="method">
                <input
                  v-model="paymentMethod"
                  type="radio"
                  value="pix"
                />
                <span>Pix</span>
              </label>
            </div>
          </div>
        </div>

        <div class="checkout-actions">
          <BaseButton
            type="submit"
            variant="primary"
            :disabled="creatingCheckout"
          >
            {{ creatingCheckout ? "Criando checkout..." : "Continuar para pagamento" }}
          </BaseButton>
        </div>

        <p v-if="createdCheckoutUrl" class="info">
          Checkout criado. URL de pagamento:
          <a :href="createdCheckoutUrl" target="_blank" rel="noopener noreferrer">
            {{ createdCheckoutUrl }}
          </a>
        </p>
      </form>
    </div>

    <div v-else-if="loading" class="state-text">
      Carregando checkout...
    </div>

    <div v-else-if="error" class="state-text error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ebf5ff, #f5fff8);
  padding: 1.5rem;
}

.checkout-card {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 35px rgba(15, 23, 42, 0.12);
  padding: 1.75rem 1.75rem 1.5rem;
}

.checkout-header {
  margin-bottom: 1rem;
}

.product-name {
  font-size: 1.4rem;
  font-weight: 700;
}

.product-code {
  margin-top: 0.2rem;
  font-size: 0.85rem;
  color: var(--rp-color-text-muted);
}

.product-description {
  font-size: 0.95rem;
  color: var(--rp-color-text-muted);
  margin-bottom: 1.25rem;
}

.checkout-summary {
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: #f9fafb;
  padding: 0.9rem 1rem 1.1rem;
  margin-bottom: 1.3rem;
}

.summary-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--rp-color-text-main);
}

.summary-line + .summary-line {
  margin-top: 0.25rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.3rem;
}

input[type="text"],
input[type="email"] {
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.7);
  padding: 0.45rem 0.6rem;
  font-size: 0.9rem;
  background: #ffffff;
}

.method-title {
  margin-top: 0.75rem;
}

.methods {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.method {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.checkout-actions {
  display: flex;
  justify-content: flex-end;
}

.info {
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

.state-text {
  font-size: 0.95rem;
  color: var(--rp-color-text-main);
}

.state-text.error {
  color: var(--rp-color-danger);
}
</style>
