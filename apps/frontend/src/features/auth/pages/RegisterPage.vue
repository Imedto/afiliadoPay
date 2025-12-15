<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../../../lib/supabaseClient";

const router = useRouter();

const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const loading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

async function onSubmit() {
  error.value = null;
  successMessage.value = null;

  if (password.value !== confirmPassword.value) {
    error.value = "As senhas não conferem.";
    return;
  }

  loading.value = true;
  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
    });

    if (signUpError) {
      error.value = signUpError.message;
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      // Cria um tenant padrão para esse usuário e vincula em user_tenants
      const tenantName = fullName.value.trim() || email.value.trim();

      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          name: tenantName,
        })
        .select("id")
        .single();

      if (!tenantError && tenant?.id) {
        await supabase.from("user_tenants").insert({
          user_id: userId,
          tenant_id: tenant.id,
          role: "producer",
        });
      }
    }

    successMessage.value =
      "Conta criada. Verifique seu e-mail para confirmar e, depois, faça login.";

    setTimeout(() => {
      router.push({ name: "login" });
    }, 2000);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro desconhecido ao criar conta.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <section class="card">
      <h1>Criar conta</h1>
      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span>Nome completo</span>
          <input v-model="fullName" type="text" autocomplete="name" required />
        </label>

        <label class="field">
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>

        <label class="field">
          <span>Senha</span>
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
          />
        </label>

        <label class="field">
          <span>Confirmar senha</span>
          <input
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
          />
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? "Criando..." : "Criar conta" }}
        </button>

        <p v-if="error" class="error">
          {{ error }}
        </p>
        <p v-if="successMessage" class="success">
          {{ successMessage }}
        </p>

        <p class="hint">
          Já tem uma conta?
          <RouterLink :to="{ name: 'login' }">Entrar</RouterLink>
        </p>
      </form>
    </section>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #e0f2fe, #f4f5fb);
}

.card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--rp-color-border-subtle);
  color: var(--rp-color-text-main);
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input {
  border-radius: 8px;
  border: 1px solid var(--rp-color-border-subtle);
  background: #f9fafb;
  color: var(--rp-color-text-main);
  padding: 0.55rem 0.75rem;
  font-size: 0.9rem;
}

input:focus {
  outline: none;
  border-color: var(--rp-color-primary);
  box-shadow: 0 0 0 1px rgba(22, 163, 74, 0.35);
}

button {
  margin-top: 0.5rem;
  background: linear-gradient(
    to right,
    var(--rp-color-primary-gradient-from),
    var(--rp-color-primary-gradient-to)
  );
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
}

button[disabled] {
  opacity: 0.6;
  cursor: default;
}

.error {
  color: var(--rp-color-danger);
  font-size: 0.85rem;
}

.success {
  color: #16a34a;
  font-size: 0.85rem;
}

.hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--rp-color-text-muted);
}

.hint a {
  color: var(--rp-color-primary);
}
</style>
