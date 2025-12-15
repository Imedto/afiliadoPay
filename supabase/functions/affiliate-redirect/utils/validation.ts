import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

export const paramsSchema = z.object({
  slug: z.string().min(1),
});

export type AffiliateRedirectParams = z.infer<typeof paramsSchema>;

