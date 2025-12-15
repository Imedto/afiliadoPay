-- Tenants, perfis e vínculo usuário-tenant

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.tenants enable row level security;

-- Para simplificar, apenas usuários autenticados podem ver tenants
create policy "auth_select_tenants"
on public.tenants
for select
using (auth.role() = 'authenticated');

-- Papel do usuário dentro de um tenant
create type public.tenant_role as enum ('producer', 'affiliate', 'admin', 'support');

create table public.user_tenants (
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role public.tenant_role not null default 'producer',
  primary key (user_id, tenant_id),
  created_at timestamptz not null default now()
);

alter table public.user_tenants enable row level security;

-- Usuário só vê seus próprios vínculos de tenant
create policy "user_select_own_tenants"
on public.user_tenants
for select
using (user_id = auth.uid());

-- Perfis públicos básicos, 1:1 com auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "user_select_own_profile"
on public.profiles
for select
using (id = auth.uid());

create policy "user_update_own_profile"
on public.profiles
for update
using (id = auth.uid());

-- Trigger para updated_at
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_current_timestamp_updated_at();

