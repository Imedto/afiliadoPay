import { supabaseAdmin } from "../vendas-api/db/client.ts";

export interface PaymentEvent {
  id: string;
  provider: string;
  event_id: string;
  payload_hash: string;
  status: string;
  error_message: string | null;
  raw_payload: unknown;
  processed_at: string | null;
  created_at: string;
}

export async function findPaymentEvent(
  provider: string,
  eventId: string,
): Promise<PaymentEvent | null> {
  const { data, error } = await supabaseAdmin
    .from("payment_events")
    .select("*")
    .eq("provider", provider)
    .eq("event_id", eventId)
    .maybeSingle<PaymentEvent>();

  if (error) {
    console.error("Error querying payment_events", error);
    return null;
  }

  return data ?? null;
}

export async function insertPaymentEvent(
  provider: string,
  eventId: string,
  payloadHash: string,
  payload: unknown,
): Promise<PaymentEvent | null> {
  const { data, error } = await supabaseAdmin
    .from("payment_events")
    .insert({
      provider,
      event_id: eventId,
      payload_hash: payloadHash,
      raw_payload: payload,
    })
    .select("*")
    .maybeSingle<PaymentEvent>();

  if (error) {
    // conflito de unicidade (evento já inserido)
    if (error.code === "23505") {
      return await findPaymentEvent(provider, eventId);
    }
    console.error("Error inserting payment_events", error);
    return null;
  }

  return data ?? null;
}

export async function markPaymentEventProcessed(
  provider: string,
  eventId: string,
  errorMessage?: string,
): Promise<void> {
  const status = errorMessage ? "error" : "processed";

  const { error } = await supabaseAdmin
    .from("payment_events")
    .update({
      status,
      error_message: errorMessage ?? null,
      processed_at: new Date().toISOString(),
    })
    .eq("provider", provider)
    .eq("event_id", eventId);

  if (error) {
    console.error("Error updating payment_events", error);
  }
}

