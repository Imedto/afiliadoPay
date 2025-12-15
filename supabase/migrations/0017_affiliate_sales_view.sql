-- Visão de vendas por afiliado
-- Usa somente tabelas já protegidas por RLS.

create or replace view public.affiliate_sales as
select
  bs.id as sale_id,
  bs.tenant_id,
  bs.affiliate_id,
  a.name as affiliate_name,
  bs.product_id,
  bs.product_code,
  bs.product_name,
  bs.status,
  bs.valor_bruto,
  bs.valor_liquido,
  bs.comissao_afiliado,
  bs.created_at,
  bs.finalized_at
from public.billing_sales bs
join public.affiliates a
  on a.id = bs.affiliate_id;

