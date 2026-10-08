# Testes de banco

- `rls_check.sql` — teste completo de isolamento (leitura, update, delete, insert, anon, papéis).
  Roda em todo `pnpm test:rls` num Postgres descartável com todas as migrations
  (`tests/db/rls.test.ts`), incluindo meta-testes que quebram uma policy de propósito.
- `rls_check_remote.sql` — variante enxuta (leitura + insert + anon) para rodar no projeto Supabase
  real após cada migration (pelo SQL Editor ou MCP `execute_sql`). Termina sempre com exceção
  (`RLS_OK…` ou `RLS_FAIL…`), então nada é gravado.

Ao criar uma tabela com `org_id`, adicione a fixture dela nos dois arquivos; senão o teste falha.
