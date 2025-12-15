<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/useAuthStore";

const authStore = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");

async function onSubmit() {
  await authStore.login(email.value.trim(), password.value);
  if (authStore.isAuthenticated) {
    router.push({ name: "sales" });
  }
}
</script>

<template>
  <div class="page">
    <section class="card">
      <h1>Login</h1>
      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>

        <label class="field">
          <span>Senha</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>

        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? "Entrando..." : "Entrar" }}
        </button>

        <p v-if="authStore.error" class="error">
          {{ authStore.error }}
        </p>

        <p class="hint">
          Ainda não tem conta?
          <RouterLink :to="{ name: 'register' }">Criar conta</RouterLink>
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
  max-width: 360px;
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
  gap: 1rem;
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

.hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--rp-color-text-muted);
}

.hint a {
  color: var(--rp-color-primary);
}
</style>
