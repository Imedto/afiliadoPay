-- Configuração básica de gateways de pagamento por tenant

create type public.payment_provider as enum ('pagseguro', 'pagarme', 'cielo', 'asaas', 'wirecard');

create table public.payment_gateways (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  provider public.payment_provider not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.payment_gateways enable row level security;

create policy "user_select_gateways_by_tenant"
on public.payment_gateways
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_insert_gateways_for_tenant"
on public.payment_gateways
for insert
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

