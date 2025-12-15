-- Permite que usuários do tenant atualizem o status de comissões
-- (ex.: aprovar, marcar como paga ou cancelar).

create policy "user_update_commissions_by_tenant"
on public.commissions
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

