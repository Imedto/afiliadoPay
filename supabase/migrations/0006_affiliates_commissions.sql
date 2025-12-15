-- Afiliados e comissões básicas

create type public.affiliate_status as enum ('active', 'inactive', 'pending');

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  email text,
  document text,
  status public.affiliate_status not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.affiliates enable row level security;

create policy "user_select_affiliates_by_tenant"
on public.affiliates
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_insert_affiliates_for_tenant"
on public.affiliates
for insert
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create type public.commission_status as enum ('pending', 'approved', 'paid', 'cancelled');

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sale_id uuid not null references public.billing_sales(id) on delete cascade,
  affiliate_id uuid not null references public.affiliates(id) on delete restrict,
  amount numeric(12,2) not null,
  status public.commission_status not null default 'pending',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.commissions enable row level security;

create policy "user_select_commissions_by_tenant"
on public.commissions
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

