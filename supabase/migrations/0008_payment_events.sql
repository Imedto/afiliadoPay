-- Eventos de pagamento (idempotência e auditoria de webhooks)

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  payload_hash text not null,
  status text not null default 'received',
  error_message text,
  raw_payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

alter table public.payment_events enable row level security;

-- Apenas service role / Edge Functions devem acessar diretamente esta tabela.
-- Mantemos uma política restrita: nenhum acesso por clientes autenticados.
create policy "deny_all_payment_events"
on public.payment_events
as restrictive
for all
using (false)
with check (false);

