-- Área de membros: cursos e aulas

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "user_select_courses_by_tenant"
on public.courses
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_insert_courses_for_tenant"
on public.courses
for insert
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_update_courses_for_tenant"
on public.courses
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

create type public.lesson_status as enum ('draft', 'published');

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content_url text,
  status public.lesson_status not null default 'draft',
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "user_select_lessons_by_tenant"
on public.lessons
for select
using (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

create policy "user_insert_lessons_for_tenant"
on public.lessons
for insert
with check (
  tenant_id in (
    select ut.tenant_id from public.user_tenants ut where ut.user_id = auth.uid()
  )
);

