-- Liga afiliados a usuários de autenticação e expõe visões "self-service"
-- para o portal do afiliado.

-- 1) Coluna opcional com o id do usuário Supabase (auth.users)
alter table public.affiliates
  add column if not exists auth_user_id uuid;

-- Preenche automaticamente auth_user_id quando o e-mail do afiliado
-- coincide com o e-mail do usuário autenticado.
update public.affiliates a
set auth_user_id = u.id
from auth.users u
where a.email is not null
  and lower(a.email) = lower(u.email)
  and a.auth_user_id is null;

-- 2) Política de leitura para o próprio afiliado (sem precisar de tenant)
create policy "affiliate_self_select_by_auth_user"
on public.affiliates
for select
using (auth_user_id = auth.uid());

-- 3) Políticas para o afiliado ver suas comissões e vendas

create policy "affiliate_self_select_commissions"
on public.commissions
for select
using (
  affiliate_id in (
    select id from public.affiliates where auth_user_id = auth.uid()
  )
);

create policy "affiliate_self_select_sales"
on public.billing_sales
for select
using (
  affiliate_id in (
    select id from public.affiliates where auth_user_id = auth.uid()
  )
);

create policy "affiliate_self_select_links"
on public.affiliate_links
for select
using (
  affiliate_id in (
    select id from public.affiliates where auth_user_id = auth.uid()
  )
);

-- 4) Visões específicas para o portal do afiliado

create or replace view public.my_affiliate_stats as
select
  s.*
from public.affiliate_stats s
join public.affiliates a
  on a.id = s.affiliate_id
where a.auth_user_id = auth.uid();

create or replace view public.my_affiliate_sales as
select
  s.*
from public.affiliate_sales s
join public.affiliates a
  on a.id = s.affiliate_id
where a.auth_user_id = auth.uid();
