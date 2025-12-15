// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { supabaseAdmin } from "../vendas-api/db/client.ts";

const paramsSchema = z.object({
  slug: z.string().min(1),
});

serve(async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const slug = parts[parts.length - 1];

    const parsed = paramsSchema.safeParse({ slug });
    if (!parsed.success) {
      return json(400, { error: "invalid_slug", message: parsed.error.message });
    }

    const { slug: publicSlug } = parsed.data;

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select(
        "id, tenant_id, public_slug, code, name, description, status, is_public",
      )
      .eq("public_slug", publicSlug)
      .eq("is_public", true)
      .eq("status", "active" as any)
      .maybeSingle();

    if (productError) {
      console.error("checkout-public product error", productError);
      return json(500, { error: "db_error", message: productError.message });
    }

    if (!product) {
      return json(404, { error: "not_found", message: "Produto não encontrado" });
    }

    const { data: checkoutConfig, error: checkoutError } = await supabaseAdmin
      .from("product_checkout_configs")
      .select(
        "template, primary_color, secondary_color, success_redirect_url, cancel_redirect_url",
      )
      .eq("tenant_id", product.tenant_id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (checkoutError) {
      console.error("checkout-public config error", checkoutError);
      return json(500, { error: "db_error", message: checkoutError.message });
    }

    // Busca plano/preço padrão do produto
    const { data: plan, error: planError } = await supabaseAdmin
      .from("product_plans")
      .select("id, price, billing_type")
      .eq("tenant_id", product.tenant_id)
      .eq("product_id", product.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (planError) {
      console.error("checkout-public plan error", planError);
      return json(500, { error: "db_error", message: planError.message });
    }

    return json(200, {
      product,
      checkoutConfig,
      plan,
    });
  } catch (err) {
    console.error("checkout-public unexpected", err);
    return json(500, {
      error: "internal_error",
      message: "Unexpected error",
    });
  }
});

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
