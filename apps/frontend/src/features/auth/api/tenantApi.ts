import { supabase } from "../../../lib/supabaseClient";

export interface UserTenant {
  user_id: string;
  tenant_id: string;
  role: "producer" | "affiliate" | "admin" | "support";
}

export async function fetchUserTenants(userId: string): Promise<UserTenant[]> {
  const { data, error, status } = await supabase
    .from("user_tenants")
    .select("user_id, tenant_id, role")
    .eq("user_id", userId);

  // Se a tabela ainda não existir (migrations não aplicadas), evita quebrar o app
  if (error) {
    if (status === 404) {
      console.warn(
        "Tabela user_tenants não encontrada. Certifique-se de rodar as migrations no Supabase.",
      );
      return [];
    }
    throw new Error(error.message);
  }

  return (data ?? []) as UserTenant[];
}

export async function ensureDefaultTenant(userId: string, nameHint: string): Promise<UserTenant | null> {
  // Cria tenant e vínculo básico para o usuário
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      name: nameHint,
    })
    .select("id")
    .single();

  if (tenantError || !tenant?.id) {
    console.warn("Erro ao criar tenant padrão:", tenantError?.message);
    return null;
  }

  const { data: link, error: linkError } = await supabase
    .from("user_tenants")
    .insert({
      user_id: userId,
      tenant_id: tenant.id,
      role: "producer",
    })
    .select("user_id, tenant_id, role")
    .single();

  if (linkError || !link) {
    console.warn("Erro ao criar vínculo em user_tenants:", linkError?.message);
    return null;
  }

  return link as UserTenant;
}

