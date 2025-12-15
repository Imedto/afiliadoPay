import { supabase } from "../../../lib/supabaseClient";

export type PaymentProvider = "pagseguro" | "pagarme" | "cielo" | "asaas" | "wirecard";

export interface PaymentGateway {
  id: string;
  tenant_id: string;
  provider: PaymentProvider;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateGatewayInput {
  tenantId: string;
  provider: PaymentProvider;
  name: string;
}

export async function fetchGateways(): Promise<PaymentGateway[]> {
  const { data, error } = await supabase
    .from("payment_gateways")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as PaymentGateway[];
}

export async function createGateway(input: CreateGatewayInput): Promise<PaymentGateway> {
  const { data, error } = await supabase
    .from("payment_gateways")
    .insert({
      tenant_id: input.tenantId,
      provider: input.provider,
      name: input.name,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as PaymentGateway;
}

