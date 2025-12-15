-- Migration: criação de tabelas de billing e API keys para a API de vendas

create table if not exists public.billing_api_keys (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid not null,
  api_key text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.billing_api_keys enable row level security;

-- Opcional: política de leitura apenas pelo próprio usuário dono da key, se exposto ao client.
-- Em geral, esta tabela é usada apenas por Edge Functions com service role.
create policy "owner_can_select_billing_api_keys"
on public.billing_api_keys
for select
using (auth.uid() = user_id);

create table if not exists public.billing_sales (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  producer_id uuid not null,
  affiliate_id uuid,
  product_id uuid not null,
  product_code text not null,
  product_name text not null,
  product_price numeric(12,2) not null,

  plan_id uuid,
  plan_code text,
  plan_name text,
  plan_price numeric(12,2),
  plan_items int,

  order_bumps jsonb default '[]'::jsonb,

  transaction_code text not null,
  created_at timestamptz not null default now(),
  finalized_at timestamptz,
  payment_method int not null,
  status int not null,

  checkout_url text,
  boleto_url text,
  boleto_linha_digitavel text,
  boleto_vencimento date,

  valor_produto numeric(12,2) not null,
  valor_bruto numeric(12,2) not null,
  valor_frete numeric(12,2) not null default 0,
  valor_desconto numeric(12,2) not null default 0,
  valor_liquido numeric(12,2) not null,
  comissao_afiliado numeric(12,2),

  campaign_id uuid,
  campaign_name text,

  src text,
  utm_source text,
  utm_medium text,
  utm_content text,
  utm_campaign text,

  buyer_name text not null,
  buyer_email text not null,
  buyer_cpf_cnpj text not null,
  buyer_phone text,
  buyer_cep text,
  buyer_street text,
  buyer_number text,
  buyer_complement text,
  buyer_district text,
  buyer_city text,
  buyer_state text,
  buyer_country text,

  affiliate_name text,
  affiliate_phone text,
  affiliate_email text,

  producer_name text not null,
  producer_cpf_cnpj text not null,
  producer_phone text,
  producer_email text
);

alter table public.billing_sales enable row level security;

-- Política de tenant: usuário só vê registros do seu tenant
create policy "tenant_select_billing_sales"
on public.billing_sales
for select
using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Política extra: produtor ou afiliado só veem suas próprias vendas
create policy "producer_or_affiliate_see_own_sales"
on public.billing_sales
for select
using (
  auth.uid() = producer_id
  or auth.uid() = affiliate_id
);
