// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { supabaseAdmin } from "../vendas-api/db/client.ts";

const querySchema = z.object({
  q: z.string().optional(),
  page: z
    .string()
    .transform((v) => Number.parseInt(v, 10))
    .refine((n) => !Number.isNaN(n) && n > 0, "page must be positive")
    .optional()
    .default(1),
});

const PAGE_SIZE = 20;

serve(async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const parsed = querySchema.safeParse(query);

    if (!parsed.success) {
      return json(400, { error: "invalid_query", message: parsed.error.message });
    }

    const { q, page } = parsed.data;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let supaQuery = supabaseAdmin
      .from("products")
      .select("id, public_slug, code, name, description, status")
      .eq("is_public", true)
      .eq("status", "active" as any);

    if (q) {
      const like = `%${q}%`;
      supaQuery = supaQuery.ilike("name", like);
    }

    const { data, error } = await supaQuery
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("products-marketplace error", error);
      return json(500, { error: "db_error", message: error.message });
    }

    return json(200, { items: data ?? [] });
  } catch (err) {
    console.error("products-marketplace unexpected", err);
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

