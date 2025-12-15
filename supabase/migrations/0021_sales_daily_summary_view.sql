-- Resumo diário de vendas por tenant, produto, afiliado e status

create or replace view public.sales_daily_summary as
select
  date_trunc('day', created_at)::date as day,
  tenant_id,
  product_id,
  affiliate_id,
  status,
  count(*) as sales_count,
  sum(valor_bruto) as total_bruto,
  sum(valor_liquido) as total_liquido
from public.billing_sales
group by 1, 2, 3, 4, 5;
