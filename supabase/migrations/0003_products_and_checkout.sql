-- Produtos, planos e configuração básica de checkout

create type public.product_status as enum ('draft', 'active', 'archived');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  status public.product_status not null default 'draft',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Usuário só vê produtos dos tenants aos quais pertence
create policy "user_select_products_by_tenant"
on public.products
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

-- Produtor pode inserir produtos apenas para tenants que possui vínculo
create policy "user_insert_products_for_tenant"
on public.products
for insert
with check (
  created_by = auth.uid()
  and tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

-- Produtor pode atualizar produtos dos seus tenants
create policy "user_update_products_for_tenant"
on public.products
for update
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
)
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

-- Trigger para updated_at
create or replace function public.set_products_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();

-- Planos de produto
create type public.plan_billing_type as enum ('one_time', 'recurring');

create table public.product_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null,
  billing_type public.plan_billing_type not null default 'one_time',
  interval_count int,
  interval_unit text, -- ex.: 'day', 'month', 'year'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_plans enable row level security;

create policy "user_select_product_plans_by_tenant"
on public.product_plans
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_insert_product_plans_for_tenant"
on public.product_plans
for insert
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_update_product_plans_for_tenant"
on public.product_plans
for update
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
)
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create or replace function public.set_product_plans_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_product_plans_updated_at
before update on public.product_plans
for each row
execute function public.set_product_plans_updated_at();

-- Configuração simples de checkout por produto
create type public.checkout_template as enum ('default', 'template_a', 'template_b', 'template_c');

create table public.product_checkout_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  template checkout_template not null default 'default',
  primary_color text,
  secondary_color text,
  success_redirect_url text,
  cancel_redirect_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, product_id)
);

alter table public.product_checkout_configs enable row level security;

create policy "user_select_checkout_configs_by_tenant"
on public.product_checkout_configs
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_insert_checkout_configs_for_tenant"
on public.product_checkout_configs
for insert
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_update_checkout_configs_for_tenant"
on public.product_checkout_configs
for update
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
)
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create or replace function public.set_product_checkout_configs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_product_checkout_configs_updated_at
before update on public.product_checkout_configs
for each row
execute function public.set_product_checkout_configs_updated_at();

