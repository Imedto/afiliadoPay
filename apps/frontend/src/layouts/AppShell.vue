<script setup lang="ts">
import { computed } from "vue";
import { useRouter, RouterLink, RouterView } from "vue-router";
import { useAuthStore } from "../features/auth/store/useAuthStore";

const authStore = useAuthStore();
const router = useRouter();

const userEmail = computed(() => authStore.user?.email ?? "");

async function onLogout() {
  await authStore.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="logo">
        <span class="logo-mark">R</span>
        <span class="logo-text">RenderPay</span>
      </div>

      <nav class="nav">
        <RouterLink
          to="/app"
          class="nav-item"
          active-class="nav-item--active"
        >
          Dashboard
        </RouterLink>

        <RouterLink
          to="/app/sales"
          class="nav-item"
          active-class="nav-item--active"
        >
          Vendas
        </RouterLink>

        <RouterLink
          to="/app/products"
          class="nav-item"
          active-class="nav-item--active"
        >
          Produtos
        </RouterLink>

        <RouterLink
          to="/app/affiliates"
          class="nav-item"
          active-class="nav-item--active"
        >
          Afiliados
        </RouterLink>

        <RouterLink
          to="/app/commissions"
          class="nav-item"
          active-class="nav-item--active"
        >
          Comissões
        </RouterLink>

        <RouterLink
          to="/app/reports"
          class="nav-item"
          active-class="nav-item--active"
        >
          Relatórios
        </RouterLink>

        <RouterLink
          to="/app/gateways"
          class="nav-item"
          active-class="nav-item--active"
        >
          Gateways
        </RouterLink>

        <RouterLink
          to="/app/account"
          class="nav-item"
          active-class="nav-item--active"
        >
          Conta
        </RouterLink>

        <RouterLink
          to="/app/courses"
          class="nav-item"
          active-class="nav-item--active"
        >
          Cursos
        </RouterLink>

        <RouterLink
          to="/app/marketplace"
          class="nav-item"
          active-class="nav-item--active"
        >
          Marketplace
        </RouterLink>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="topbar-title">Painel</h1>
        </div>
        <div class="topbar-right" v-if="userEmail">
          <span class="user-email">{{ userEmail }}</span>
          <button type="button" class="logout-btn" @click="onLogout">
            Sair
          </button>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: 100vh;
  background: var(--rp-color-bg);
  color: var(--rp-color-text-main);
}

.sidebar {
  background: linear-gradient(180deg, #0b1120, #020617);
  border-right: 1px solid rgba(15, 23, 42, 0.8);
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(
    to bottom right,
    var(--rp-color-primary-gradient-from),
    var(--rp-color-primary-gradient-to)
  );
  font-weight: 700;
  font-size: 1rem;
}

.logo-text {
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #f9fafb;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 1rem;
  padding-top: 0.5rem;
}

.nav-item {
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  font-size: 0.9rem;
  color: rgba(248, 250, 252, 0.78);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid transparent;
}

.nav-item--active {
  background: rgba(22, 163, 74, 0.24);
  color: #ffffff;
  border-color: rgba(22, 163, 74, 0.6);
  box-shadow: 0 0 0 1px rgba(21, 128, 61, 0.55);
}

.nav-item:hover {
  background: rgba(15, 23, 42, 0.9);
  color: #f9fafb;
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.75rem;
  border-bottom: 1px solid var(--rp-color-border-subtle);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.topbar-title {
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-email {
  font-size: 0.85rem;
  color: var(--rp-color-text-muted);
}

.logout-btn {
  background: #ffffff;
  border-radius: 999px;
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.3rem 0.9rem;
  color: var(--rp-color-text-main);
  font-size: 0.8rem;
  cursor: pointer;
}

.logout-btn:hover {
  background: var(--rp-color-bg-soft);
}

.content {
  padding: 1.5rem 1.75rem 2rem;
  min-height: 0;
}

@media (max-width: 768px) {
  .app-shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none;
  }
}
</style>
