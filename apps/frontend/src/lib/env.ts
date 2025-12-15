export interface FrontendEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  vendasApiUrl: string;
  affiliateRedirectBaseUrl: string;
}

function getEnv(key: string, fallback?: string): string {
  const value = (import.meta as any).env?.[key] as string | undefined;

  if (value && value.length > 0) {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing required env var: ${key}`);
}

const defaultVendasApiUrl =
  "https://xvolyrobfrwbibebkiiv.functions.supabase.co/vendas-api";
const defaultAffiliateRedirectBaseUrl =
  "https://xvolyrobfrwbibebkiiv.functions.supabase.co/affiliate-redirect";

export const env: FrontendEnv = {
  supabaseUrl: getEnv("VITE_SUPABASE_URL"),
  supabaseAnonKey: getEnv("VITE_SUPABASE_ANON_KEY"),
  vendasApiUrl: getEnv("VITE_VENDAS_API_URL", defaultVendasApiUrl),
  affiliateRedirectBaseUrl: getEnv(
    "VITE_AFFILIATE_REDIRECT_BASE_URL",
    defaultAffiliateRedirectBaseUrl,
  ),
};
