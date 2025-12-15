-- Garante que não haja duas comissões para a mesma venda e afiliado

alter table public.commissions
add constraint commissions_sale_affiliate_unique unique (sale_id, affiliate_id);

