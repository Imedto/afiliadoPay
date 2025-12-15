RenderPay - Nova Arquitetura (Vue 3 + Supabase)
===============================================

Este diretório contém o novo projeto migrado da plataforma de afiliados/ pagamentos, baseado em:

- Frontend: Vue 3 + Vite + TypeScript + Pinia
- Backend: Supabase (PostgreSQL, Auth, RLS, Edge Functions)

Estrutura inicial
-----------------

- `apps/frontend` – aqui ficará o app Vue 3 (a ser criado por CLI).
- `supabase/` – configuração do Supabase, migrations e Edge Functions.

Como criar o app Vue 3
----------------------

No diretório `renderpay/`, execute (no seu terminal local):

```bash
cd renderpay
npm create vue@latest apps/frontend
```

Sugestões ao criar o projeto:

- Selecione:
  - TypeScript: **Yes**
  - JSX Support: opcional (pode ser **No**)
  - Vue Router: **Yes**
  - Pinia: **Yes**
  - Vitest (tests): opcional, mas recomendado
  - ESLint/Prettier: recomendado

Depois:

```bash
cd apps/frontend
npm install
npm run dev
```

Configuração básica do Supabase
-------------------------------

Dentro de `renderpay/`:

- `supabase/config.toml` – configuração do projeto Supabase (stub inicial).
- `supabase/migrations/` – migrations SQL para criação das tabelas.
- `supabase/functions/` – Edge Functions (vendas-api, etc).

Para iniciar o Supabase local (ajuste conforme seu ambiente/CLI):

```bash
cd renderpay
supabase start
```

Para aplicar migrations:

```bash
cd renderpay
supabase db reset   # OU: supabase db push, conforme seu fluxo
```

Observação: o arquivo de migration `supabase/migrations/0001_create_billing_tables.sql`
contém a criação das tabelas de API key e vendas (`billing_api_keys` e `billing_sales`),
que são usadas pela Edge Function `vendas-api`.

Gateways de pagamento
---------------------

Hoje o fluxo de checkout suporta dois provedores, configuráveis por produto:

- **PagSeguro** – via função `checkout-create` com criação de link (`v2/checkout`) e webhook
  `payments-pagseguro-webhook`.
- **Pagar.me** – via função `checkout-create` com criação de ordem/checkout e webhook
  `payments-pagarme-webhook`.

Configuração necessária:

1. Variáveis de ambiente das Edge Functions (no Supabase):

   - PagSeguro:
     - `FUNCTION_SUPABASE_URL`
     - `FUNCTION_SUPABASE_SERVICE_ROLE_KEY`
     - `PAGSEGURO_EMAIL`
     - `PAGSEGURO_TOKEN`
     - `PAGSEGURO_ENV` (`sandbox` ou `production`)
   - Pagar.me:
     - `PAGARME_API_KEY` – API Key do projeto (de preferência sandbox em desenvolvimento).

2. Deploy das funções:

   ```bash
   cd renderpay
   supabase functions deploy checkout-create --project-ref <PROJECT_REF>
   supabase functions deploy payments-pagseguro-webhook --project-ref <PROJECT_REF>
   supabase functions deploy payments-pagarme-webhook --project-ref <PROJECT_REF>
   ```

3. Configurar gateways no painel interno:

   - Em `/app/gateways`, crie registros para:
     - `provider = pagseguro`
     - `provider = pagarme`
   - Em `/app/products → Configurar checkout`, selecione o gateway desejado para cada produto.

4. Webhooks nos provedores:

   - PagSeguro: configurar o endpoint de notificação apontando para
     `https://<SEU-PROJETO>.functions.supabase.co/payments-pagseguro-webhook`.
   - Pagar.me: configurar webhook de eventos apontando para
     `https://<SEU-PROJETO>.functions.supabase.co/payments-pagarme-webhook`.

Ambos webhooks utilizam a tabela `payment_events` para idempotência e atualizam:

- `billing_sales.status` / `finalized_at`;
- `commissions` (quando há `affiliate_id` + `comissao_afiliado`);
- `memberships` (quando há mapeamento `course_products` para área de membros).

Próximos passos sugeridos
-------------------------

- Criar o app Vue em `apps/frontend` seguindo as instruções acima.
- Configurar variáveis de ambiente do Supabase para as Edge Functions:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Implementar o módulo de UI de vendas em Vue consumindo a Edge Function `vendas-api`.
