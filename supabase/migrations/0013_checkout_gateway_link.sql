-- Liga configuração de checkout a um gateway de pagamento específico

alter table public.product_checkout_configs
add column if not exists payment_gateway_id uuid references public.payment_gateways(id);

