-- Campos para controle de publicação pública de produtos

alter table public.products
add column if not exists is_public boolean not null default false,
add column if not exists public_slug text unique;

