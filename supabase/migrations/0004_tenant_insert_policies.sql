-- Permitir que usuários autenticados criem tenants e vínculos em user_tenants

-- Política para inserção em tenants
create policy "user_insert_tenants"
on public.tenants
for insert
with check (auth.role() = 'authenticated');

-- Política para inserção em user_tenants (vínculo usuário-tenant)
create policy "user_insert_own_user_tenants"
on public.user_tenants
for insert
with check (user_id = auth.uid());

