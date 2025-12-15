// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

import { apiKeyHeaderSchema, apiRequestSchema } from "./utils/validation.ts";
import { log } from "./utils/logger.ts";
import { HttpError, jsonResponse } from "./utils/errors.ts";
import { findApiKey } from "./db/apiKeys.ts";
import { queryVendasForUser } from "./db/vendas.ts";
import { buildApiVendasResponse } from "./services/vendasService.ts";

serve(async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "POST") {
      throw new HttpError(405, "method_not_allowed", "Use POST");
    }

    const rawApiKey = req.headers.get("authorization");
    if (!rawApiKey) {
      throw new HttpError(401, "missing_api_key", "Missing Authorization header");
    }

    const apiKeyResult = apiKeyHeaderSchema.safeParse(rawApiKey);
    if (!apiKeyResult.success) {
      throw new HttpError(401, "invalid_api_key", "Invalid API key");
    }
    const apiKey = apiKeyResult.data;

    const apiKeyRecord = await findApiKey(apiKey);
    if (!apiKeyRecord) {
      throw new HttpError(401, "unauthorized", "Invalid API key");
    }

    let bodyJson: any = {};
    try {
      const text = await req.text();
      bodyJson = text ? JSON.parse(text) : {};
    } catch {
      throw new HttpError(400, "invalid_json", "Invalid JSON body");
    }

    const parsed = apiRequestSchema.safeParse(bodyJson ?? {});
    if (!parsed.success) {
      throw new HttpError(400, "invalid_body", parsed.error.message);
    }

    const filters = parsed.data.filters ?? { page: 1 };

    log("info", "vendas-api request", {
      requestId,
      apiKeyId: apiKeyRecord.id,
      tenantId: apiKeyRecord.tenant_id,
      userId: apiKeyRecord.user_id,
      filters,
    });

    const result = await queryVendasForUser(
      apiKeyRecord.tenant_id,
      apiKeyRecord.user_id,
      filters,
    );

    const responsePayload = buildApiVendasResponse(result);

    log("info", "vendas-api response", {
      requestId,
      total: result.total,
      pages: result.pages,
    });

    return jsonResponse(200, responsePayload);
  } catch (err) {
    if (err instanceof HttpError) {
      log("warn", "http_error", {
        requestId,
        status: err.status,
        code: err.code,
        message: err.message,
      });
      return jsonResponse(err.status, {
        error: err.code,
        message: err.message,
      });
    }

    if (err instanceof z.ZodError) {
      log("warn", "zod_error", {
        requestId,
        issues: err.issues,
      });
      return jsonResponse(400, {
        error: "invalid_request",
        message: err.message,
      });
    }

    log("error", "unexpected_error", {
      requestId,
      error: String(err),
    });

    return jsonResponse(500, {
      error: "internal_error",
      message: "Unexpected error",
    });
  }
});

