-- Configuração de comissão de afiliado por produto/checkout

create type public.affiliate_commission_type as enum ('percent', 'fixed');

alter table public.product_checkout_configs
  add column if not exists affiliate_commission_type public.affiliate_commission_type default 'percent',
  add column if not exists affiliate_commission_value numeric(12,2) default 0;

