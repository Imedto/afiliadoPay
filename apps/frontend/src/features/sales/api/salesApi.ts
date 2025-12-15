import { env } from "../../../lib/env";

export interface SalesFilters {
  page?: number;
  inicio?: string;
  fim?: string;
  transacao?: string;
  status?: number;
  produto?: string;
  comprador?: string;
  pagamento?: number;
}

export interface VendasInfo {
  total_registros: number;
  paginas: number;
  comissao_afiliado: string;
  valor_vendas: string;
}

export interface VendaItem {
  produto: {
    codigo: string;
    nome: string;
    preco: string;
  };
  plano?: {
    codigo: string;
    nome: string;
    preco: string;
    qtd_itens: number;
  };
  venda: {
    transacao: string;
    dataPedido: string;
    dataFinalizada: string | null;
    formaPagamento: string;
    statusTransacao: number;
    parcelas: number;
    valor_produto: string;
    valor_liquido: string;
  };
  comprador: {
    nome: string;
    email: string;
    cnpj_cpf: string;
    cidade: string | null;
    estado: string | null;
  };
}

export interface VendasApiResponse {
  info: VendasInfo;
  dados?: VendaItem[];
  mensagem?: string;
}

export async function fetchSales(
  apiKey: string,
  filters: SalesFilters = {},
): Promise<VendasApiResponse> {
  const response = await fetch(env.vendasApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ filters }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Erro ao buscar vendas (${response.status}): ${text || response.statusText}`,
    );
  }

  return (await response.json()) as VendasApiResponse;
}

