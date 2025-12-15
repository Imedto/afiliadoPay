-- Associações de acesso à área de membros (matrículas)

create type public.membership_status as enum ('active', 'cancelled', 'expired');

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  sale_id uuid references public.billing_sales(id) on delete set null,
  status public.membership_status not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.memberships enable row level security;

-- O próprio usuário visualiza suas matrículas
create policy "member_select_own_memberships"
on public.memberships
for select
using (user_id = auth.uid());

-- Produtor / equipe podem visualizar matrículas do tenant (para gestão)
create policy "tenant_select_memberships"
on public.memberships
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

