-- Progresso de aulas na área de membros

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id, course_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

-- O próprio usuário pode ver e criar progresso apenas para cursos onde
-- possui membership ativa.

create policy "user_select_own_lesson_progress"
on public.lesson_progress
for select
using (
  user_id = auth.uid()
);

create policy "user_insert_own_lesson_progress"
on public.lesson_progress
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.memberships m
    where m.user_id = auth.uid()
      and m.tenant_id = lesson_progress.tenant_id
      and m.course_id = lesson_progress.course_id
      and m.status = 'active'
  )
);

create policy "user_delete_own_lesson_progress"
on public.lesson_progress
for delete
using (
  user_id = auth.uid()
);

