import { supabaseAdmin } from "./client.ts";

export interface ApiKeyRecord {
  id: string;
  api_key: string;
  user_id: string;
  tenant_id: string;
  is_active: boolean;
}

export async function findApiKey(apiKey: string): Promise<ApiKeyRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("billing_api_keys")
    .select("*")
    .eq("api_key", apiKey)
    .eq("is_active", true)
    .maybeSingle<ApiKeyRecord>();

  if (error) {
    console.error("Error querying billing_api_keys", error);
    return null;
  }

  return data ?? null;
}

