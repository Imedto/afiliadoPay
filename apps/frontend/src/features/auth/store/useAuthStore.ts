import { defineStore } from "pinia";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabaseClient";
import { ensureDefaultTenant, fetchUserTenants, type UserTenant } from "../api/tenantApi";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  tenants: UserTenant[];
  activeTenantId: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    tenants: [],
    activeTenantId: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    setActiveTenant(tenantId: string) {
      this.activeTenantId = tenantId;
    },
    async loadTenants(userId: string) {
      let tenants = await fetchUserTenants(userId);

      // Se não houver tenant vinculado ainda, cria um padrão
      if (tenants.length === 0) {
        const nameHint = this.user?.email ?? "Meu negócio";
        const created = await ensureDefaultTenant(userId, nameHint);
        if (created) {
          tenants = [created];
        }
      }

      this.tenants = tenants;
      if (!this.activeTenantId && tenants.length > 0) {
        this.activeTenantId = tenants[0].tenant_id;
      }
    },
    async init() {
      this.loading = true;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        this.user = user ?? null;
        if (user) {
          await this.loadTenants(user.id);
        }
      } finally {
        this.loading = false;
      }
    },
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          this.error = error.message;
          return;
        }
        this.user = data.user ?? null;
        if (data.user) {
          await this.loadTenants(data.user.id);
        }
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : "Erro desconhecido ao fazer login.";
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      await supabase.auth.signOut();
      this.user = null;
      this.tenants = [];
      this.activeTenantId = null;
    },
  },
});
