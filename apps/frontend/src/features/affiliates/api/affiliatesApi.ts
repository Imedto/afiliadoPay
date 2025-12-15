import { supabase } from "../../../lib/supabaseClient";

export type AffiliateStatus = "active" | "inactive" | "pending";

export interface Affiliate {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  document: string | null;
  status: AffiliateStatus;
  created_at: string;
}

export interface CreateAffiliateInput {
  tenantId: string;
  name: string;
  email?: string;
  document?: string;
}

export async function fetchAffiliates(): Promise<Affiliate[]> {
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Affiliate[];
}

export async function createAffiliate(
  input: CreateAffiliateInput,
): Promise<Affiliate> {
  const { data, error } = await supabase
    .from("affiliates")
    .insert({
      tenant_id: input.tenantId,
      name: input.name,
      email: input.email ?? null,
      document: input.document ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Affiliate;
}

