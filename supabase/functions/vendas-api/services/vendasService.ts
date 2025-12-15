import type { VendasQueryResult, VendaRow } from "../db/vendas.ts";

export interface VendaResponse {
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
  plano_adicional1?: {
    codigo: string;
    nome: string;
    preco: string;
  };
  plano_adicional2?: {
    codigo: string;
    nome: string;
    preco: string;
  };
  plano_adicional3?: {
    codigo: string;
    nome: string;
    preco: string;
  };
  venda: {
    transacao: string;
    dataPedido: string;
    dataFinalizada: string | null;
    formaPagamento: string;
    statusTransacao: number;
    parcelas: number;
    url_checkout: string;
    link_boleto: string | null;
    linha_digitavel: string | null;
    data_vencimento_boleto: string | null;
    valor_produto: string;
    valor_bruto: string;
    valor_frete: string;
    valor_desconto: string;
    valor_liquido: string;
    campanha: string | null;
    src: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_content: string | null;
    utm_campaign: string | null;
  };
  afiliado?: {
    nome: string;
    telefone: string | null;
    email: string | null;
  };
  comprador: {
    nome: string;
    email: string;
    cnpj_cpf: string;
    telefone: string | null;
    cep: string | null;
    rua: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    pais: string | null;
  };
  produtor: {
    cnpj_cpf: string;
    nome: string;
    telefone: string | null;
    email: string | null;
  };
}

export interface ApiVendasResponse {
  info: {
    total_registros: number;
    paginas: number;
    comissao_afiliado: string;
    valor_vendas: string;
  };
  dados?: VendaResponse[];
  mensagem?: string;
}

const paymentMethodLabel: Record<number, string> = {
  1: "Cartão de crédito",
  2: "Boleto",
  3: "Pix",
};

function formatMoney(value: number | null | undefined): string {
  const n = value ?? 0;
  return n.toFixed(2);
}

function mapVendaRow(row: VendaRow): VendaResponse {
  const methodLabel = paymentMethodLabel[row.payment_method] ?? "Desconhecido";

  const vendaBase: VendaResponse = {
    produto: {
      codigo: row.product_code,
      nome: row.product_name,
      preco: formatMoney(row.product_price),
    },
    venda: {
      transacao: row.transaction_code,
      dataPedido: row.created_at,
      dataFinalizada: row.finalized_at,
      formaPagamento: methodLabel,
      statusTransacao: row.status,
      parcelas: 1,
      url_checkout: row.checkout_url ?? "",
      link_boleto: row.boleto_url,
      linha_digitavel: row.boleto_linha_digitavel,
      data_vencimento_boleto: row.boleto_vencimento,
      valor_produto: formatMoney(row.valor_produto),
      valor_bruto: formatMoney(row.valor_bruto),
      valor_frete: formatMoney(row.valor_frete),
      valor_desconto: formatMoney(row.valor_desconto),
      valor_liquido: formatMoney(row.valor_liquido),
      campanha: row.campaign_name,
      src: row.src,
      utm_source: row.utm_source,
      utm_medium: row.utm_medium,
      utm_content: row.utm_content,
      utm_campaign: row.utm_campaign,
    },
    comprador: {
      nome: row.buyer_name,
      email: row.buyer_email,
      cnpj_cpf: row.buyer_cpf_cnpj,
      telefone: row.buyer_phone,
      cep: row.buyer_cep,
      rua: row.buyer_street,
      numero: row.buyer_number,
      complemento: row.buyer_complement,
      bairro: row.buyer_district,
      cidade: row.buyer_city,
      estado: row.buyer_state,
      pais: row.buyer_country,
    },
    produtor: {
      cnpj_cpf: row.producer_cpf_cnpj,
      nome: row.producer_name,
      telefone: row.producer_phone,
      email: row.producer_email,
    },
  };

  if (row.plan_id) {
    vendaBase.plano = {
      codigo: row.plan_code ?? "",
      nome: row.plan_name ?? "",
      preco: formatMoney(row.plan_price),
      qtd_itens: row.plan_items ?? 1,
    };
  }

  if (row.order_bumps?.[0]) {
    vendaBase.plano_adicional1 = {
      codigo: row.order_bumps[0].plan_code,
      nome: row.order_bumps[0].plan_name,
      preco: formatMoney(row.order_bumps[0].price),
    };
  }
  if (row.order_bumps?.[1]) {
    vendaBase.plano_adicional2 = {
      codigo: row.order_bumps[1].plan_code,
      nome: row.order_bumps[1].plan_name,
      preco: formatMoney(row.order_bumps[1].price),
    };
  }
  if (row.order_bumps?.[2]) {
    vendaBase.plano_adicional3 = {
      codigo: row.order_bumps[2].plan_code,
      nome: row.order_bumps[2].plan_name,
      preco: formatMoney(row.order_bumps[2].price),
    };
  }

  if (row.affiliate_name) {
    vendaBase.afiliado = {
      nome: row.affiliate_name,
      telefone: row.affiliate_phone,
      email: row.affiliate_email,
    };
  }

  return vendaBase;
}

export function buildApiVendasResponse(
  result: VendasQueryResult,
): ApiVendasResponse {
  if (result.total === 0) {
    return {
      info: {
        total_registros: 0,
        paginas: 0,
        comissao_afiliado: "0.00",
        valor_vendas: "0.00",
      },
      mensagem: "Nenhum resultado encontrado",
    };
  }

  const dados = result.items.map(mapVendaRow);

  return {
    info: {
      total_registros: result.total,
      paginas: result.pages,
      comissao_afiliado: formatMoney(result.sumComissaoAfiliado),
      valor_vendas: formatMoney(result.sumValorLiquidoProdutor),
    },
    dados,
  };
}

