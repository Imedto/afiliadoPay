import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Para Edge Functions, variáveis não podem começar com SUPABASE_.
// Usamos PREFIXO FUNCTION_ e, opcionalmente, caímos para SUPABASE_* se
// você configurar direto no painel.
const SUPABASE_URL =
  Deno.env.get("FUNCTION_SUPABASE_URL") ??
  Deno.env.get("SUPABASE_URL") ??
  "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("FUNCTION_SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase env vars missing in function environment");
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});
