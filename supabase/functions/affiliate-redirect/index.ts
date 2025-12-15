// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { paramsSchema } from "./utils/validation.ts";
import { HttpError, jsonResponse } from "./utils/errors.ts";
import { log } from "./utils/logger.ts";
import { findAffiliateLinkBySlug, registerAffiliateClick } from "./db/links.ts";

const PUBLIC_CHECKOUT_BASE_URL =
  Deno.env.get("PUBLIC_CHECKOUT_BASE_URL") ?? "http://localhost:5173/checkout";

serve(async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();

  try {
    if (req.method !== "GET") {
      throw new HttpError(405, "method_not_allowed", "Use GET");
    }

    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const slugFromPath = parts[parts.length - 1];
    const slugFromQuery = url.searchParams.get("slug") ?? undefined;

    const slug = slugFromQuery || slugFromPath;

    const parsed = paramsSchema.safeParse({ slug });
    if (!parsed.success) {
      throw new HttpError(400, "invalid_slug", parsed.error.message);
    }

    const { slug: affiliateSlug } = parsed.data;

    log("info", "affiliate_redirect_received", {
      requestId,
      slug: affiliateSlug,
    });

    const link = await findAffiliateLinkBySlug(affiliateSlug);
    if (!link || !link.product?.public_slug) {
      throw new HttpError(404, "link_not_found", "Link de afiliado não encontrado.");
    }

    await registerAffiliateClick(link.tenant_id, link.id);

    const checkoutUrl = buildCheckoutUrl(link.product.public_slug, link.affiliate_id, url);

    log("info", "affiliate_redirect_success", {
      requestId,
      linkId: link.id,
      tenantId: link.tenant_id,
      affiliateId: link.affiliate_id,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: checkoutUrl,
      },
    });
  } catch (err) {
    if (err instanceof HttpError) {
      log("warn", "affiliate_redirect_http_error", {
        requestId,
        status: err.status,
        code: err.code,
        message: err.message,
      });
      return jsonResponse(err.status, { error: err.code, message: err.message });
    }

    if (err instanceof z.ZodError) {
      log("warn", "affiliate_redirect_zod_error", {
        requestId,
        issues: err.issues,
      });
      return jsonResponse(400, {
        error: "invalid_params",
        message: err.message,
      });
    }

    log("error", "affiliate_redirect_unexpected_error", {
      requestId,
      error: String(err),
    });

    return jsonResponse(500, {
      error: "internal_error",
      message: "Erro interno ao redirecionar link de afiliado.",
    });
  }
});

function buildCheckoutUrl(
  productSlug: string,
  affiliateId: string,
  originalUrl: URL,
): string {
  const base = new URL(PUBLIC_CHECKOUT_BASE_URL);
  const basePath = base.pathname.replace(/\/$/, "");
  base.pathname = `${basePath}/${encodeURIComponent(productSlug)}`;

  base.searchParams.set("aff", affiliateId);

  const forwardParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  for (const key of forwardParams) {
    const value = originalUrl.searchParams.get(key);
    if (value) {
      base.searchParams.set(key, value);
    }
  }

  return base.toString();
}

