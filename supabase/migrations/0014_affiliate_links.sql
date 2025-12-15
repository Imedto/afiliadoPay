-- Links de afiliados e tracking básico de cliques

create table public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint affiliate_links_slug_unique unique (slug),
  constraint affiliate_links_affiliate_product_unique unique (affiliate_id, product_id)
);

alter table public.affiliate_links enable row level security;

create policy "user_select_affiliate_links_by_tenant"
on public.affiliate_links
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_insert_affiliate_links_for_tenant"
on public.affiliate_links
for insert
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_update_affiliate_links_for_tenant"
on public.affiliate_links
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

create policy "user_delete_affiliate_links_for_tenant"
on public.affiliate_links
for delete
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

-- Tracking simples de cliques sem dados pessoais diretos,
-- apenas para métricas agregadas por link.

create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  link_id uuid not null references public.affiliate_links(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.affiliate_clicks enable row level security;

create policy "user_select_affiliate_clicks_by_tenant"
on public.affiliate_clicks
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

