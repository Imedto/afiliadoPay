// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { HttpError, jsonResponse } from "./utils/errors.ts";
import { log } from "./utils/logger.ts";
import { handlePagseguroWebhook, type PagseguroWebhookPayload } from "./services/pagseguroHandler.ts";

const payloadSchema = z.object({
  notificationCode: z.string().optional(),
  notificationType: z.string().optional(),
  reference: z.string().optional(),
  status: z.union([z.string(), z.number()]).optional(),
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

    const payload = parsed.data as PagseguroWebhookPayload;

    log("info", "pagseguro_webhook_received", {
      requestId,
      notificationCode: payload.notificationCode,
      notificationType: payload.notificationType,
      reference: payload.reference,
    });

    const result = await handlePagseguroWebhook(payload, requestId);

    log("info", "pagseguro_webhook_processed", {
      requestId,
      eventId: result.event.event_id,
      alreadyProcessed: result.alreadyProcessed,
    });

    return jsonResponse(200, { ok: true });
  } catch (err) {
    if (err instanceof HttpError) {
      log("warn", "pagseguro_webhook_http_error", {
        requestId,
        status: err.status,
        code: err.code,
        message: err.message,
      });
      return jsonResponse(err.status, { error: err.code, message: err.message });
    }

    if (err instanceof z.ZodError) {
      log("warn", "pagseguro_webhook_zod_error", {
        requestId,
        issues: err.issues,
      });
      return jsonResponse(400, {
        error: "invalid_payload",
        message: err.message,
      });
    }

    log("error", "pagseguro_webhook_unexpected_error", {
      requestId,
      error: String(err),
    });

    return jsonResponse(500, {
      error: "internal_error",
      message: "Erro interno ao processar webhook.",
    });
  }
});

