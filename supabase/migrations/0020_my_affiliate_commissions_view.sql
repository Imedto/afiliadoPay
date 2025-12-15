-- Visão de comissões próprias para o portal do afiliado

create or replace view public.my_affiliate_commissions as
select
  c.id as commission_id,
  c.tenant_id,
  c.sale_id,
  c.affiliate_id,
  c.amount,
  c.status,
  c.created_at,
  c.paid_at
from public.commissions c
join public.affiliates a
  on a.id = c.affiliate_id
where a.auth_user_id = auth.uid();

