-- Mapeamento curso-produto para liberação automática de área de membros

create table public.course_products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, course_id, product_id)
);

alter table public.course_products enable row level security;

create policy "user_select_course_products_by_tenant"
on public.course_products
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_insert_course_products_for_tenant"
on public.course_products
for insert
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

-- Garante uma matrícula única por usuário/curso/tenant
alter table public.memberships
add constraint memberships_unique_user_course
unique (tenant_id, user_id, course_id);

