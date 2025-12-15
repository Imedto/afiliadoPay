import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

export const salesFiltersSchema = z.object({
  page: z
    .number()
    .int()
    .positive()
    .optional()
    .default(1),
  inicio: z.string().optional(), // "YYYY-MM-DD"
  fim: z.string().optional(), // "YYYY-MM-DD"
  transacao: z.string().optional(),
  status: z.number().int().optional(), // status_transacao
  produto: z.string().optional(), // código ou id
  comprador: z.string().optional(), // nome, email ou cpf/cnpj
  pagamento: z.number().int().optional(), // 1,2,3...
});

export type SalesFilters = z.infer<typeof salesFiltersSchema>;

export const apiRequestSchema = z.object({
  filters: salesFiltersSchema.optional(),
});

export type ApiRequestBody = z.infer<typeof apiRequestSchema>;

export const apiKeyHeaderSchema = z
  .string()
  .min(10, "API key inválida")
  .max(200, "API key inválida");

