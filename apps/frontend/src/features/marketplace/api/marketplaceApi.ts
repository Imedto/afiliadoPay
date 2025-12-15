import { env } from "../../../lib/env";

export interface MarketplaceProduct {
  id: string;
  public_slug: string | null;
  code: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
}

export interface MarketplaceResponse {
  items: MarketplaceProduct[];
}

export async function fetchMarketplaceProducts(q?: string): Promise<MarketplaceProduct[]> {
  const url = new URL(env.vendasApiUrl.replace("vendas-api", "products-marketplace"));
  if (q) {
    url.searchParams.set("q", q);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Erro ao carregar marketplace (${response.status}): ${text || response.statusText}`,
    );
  }

  const json = (await response.json()) as MarketplaceResponse;
  return json.items;
}

