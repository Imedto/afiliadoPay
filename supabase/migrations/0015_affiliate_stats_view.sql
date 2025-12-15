-- Visão agregada de desempenho de afiliados por tenant.
-- Usa apenas tabelas já protegidas por RLS.

create or replace view public.affiliate_stats as
select
  a.id as affiliate_id,
  a.tenant_id,
  a.name,
  a.email,
  coalesce(clicks.total_clicks, 0) as total_clicks,
  coalesce(sales.paid_sales, 0) as total_paid_sales,
  coalesce(comm.total_commission_amount, 0)::numeric(12,2) as total_commission_amount
from public.affiliates a
left join (
  select
    al.affiliate_id,
    count(ac.id) as total_clicks
  from public.affiliate_links al
  left join public.affiliate_clicks ac
    on ac.link_id = al.id
  group by al.affiliate_id
) as clicks
  on clicks.affiliate_id = a.id
left join (
  select
    bs.affiliate_id,
    count(*) as paid_sales
  from public.billing_sales bs
  where bs.status = 3 -- pago
  group by bs.affiliate_id
) as sales
  on sales.affiliate_id = a.id
left join (
  select
    c.affiliate_id,
    sum(c.amount) as total_commission_amount
  from public.commissions c
  group by c.affiliate_id
) as comm
  on comm.affiliate_id = a.id;

