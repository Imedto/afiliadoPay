// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { HttpError, jsonResponse } from "./utils/errors.ts";
import { log } from "./utils/logger.ts";
import { handlePagarmeWebhook, type PagarmeWebhookPayload } from "./services/pagarmeHandler.ts";

const payloadSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  data: z
    .object({
      id: z.string().optional(),
      object: z.string().optional(),
      status: z.string().optional(),
      metadata: z.record(z.unknown()).optional(),
    })
    .optional(),
});

serve(async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use POST");
    }

    let raw: any;
    try {
      const text = await req.text();
      raw = text ? JSON.parse(text) : {};
    } catch {
      throw new HttpError(400, "invalid_json", "Corpo JSON inválido.");
    }

    const parsed = payloadSchema.safeParse(raw);
    if (!parsed.success) {
      throw new HttpError(400, "invalid_payload", parsed.error.message);
    }

    const payload = parsed.data as PagarmeWebhookPayload;

    log("info", "pagarme_webhook_received", {
      requestId,
      id: payload.id ?? payload.data?.id,
      type: payload.type,
    });

    const result = await handlePagarmeWebhook(payload, requestId);

    log("info", "pagarme_webhook_processed", {
      requestId,
      eventId: result.event.event_id,
      alreadyProcessed: result.alreadyProcessed,
    });

    return jsonResponse(200, { ok: true });
  } catch (err) {
    if (err instanceof HttpError) {
      log("warn", "pagarme_webhook_http_error", {
        requestId,
        status: err.status,
        code: err.code,
        message: err.message,
      });
      return jsonResponse(err.status, { error: err.code, message: err.message });
    }

    if (err instanceof z.ZodError) {
      log("warn", "pagarme_webhook_zod_error", {
        requestId,
        issues: err.issues,
      });
      return jsonResponse(400, {
        error: "invalid_payload",
        message: err.message,
      });
    }

    log("error", "pagarme_webhook_unexpected_error", {
      requestId,
      error: String(err),
    });

    return jsonResponse(500, {
      error: "internal_error",
      message: "Erro interno ao processar webhook Pagar.me.",
    });
  }
});

