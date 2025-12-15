-- Resumo de progresso por curso na área de membros

create or replace view public.course_progress_summary as
select
  lp.course_id,
  lp.tenant_id,
  count(distinct lp.user_id) as students_with_progress,
  count(*) as total_completed_lessons
from public.lesson_progress lp
group by lp.course_id, lp.tenant_id;

