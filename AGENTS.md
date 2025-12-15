Diretrizes para o diretório renderpay
====================================

- Use TypeScript sempre que possível.
- Organize código por domínio/feature (ex.: vendas, checkout, afiliados).
- Manter separação clara entre:
  - UI (Vue),
  - serviços (integrações externas),
  - acesso a dados (Supabase/Postgres).
- Em Edge Functions:
  - usar zod para validação,
  - logs estruturados (JSON),
  - tratamento de erros explícito.

