# ADR-003: Multi-tenant em schema compartilhado com RLS

**Status:** Aceito · **Data:** 08/10/2026

## Opções

| Opção                                            | Complexidade              | Custo | Escala | Isolamento              |
| ------------------------------------------------ | ------------------------- | ----- | ------ | ----------------------- |
| **A. Schema único + `org_id` + RLS (escolhida)** | Baixa                     | Baixo | Alta   | Bom (política no banco) |
| B. Schema por seller                             | Alta (migrations N vezes) | Médio | Média  | Muito bom               |
| C. Banco por seller                              | Muito alta                | Alto  | Alta   | Máximo                  |

## Decisão

Toda tabela de negócio tem `org_id uuid not null` e RLS com `private.is_org_member(org_id)` / `private.has_org_role(org_id, roles)`. As funções auxiliares ficam no schema `private` (fora da API REST) e são `security definer` com `search_path = ''`. `anon` não tem privilégio nas tabelas. Criação de organização só pela RPC `create_organization`.

## Consequências

- \+ Simples de evoluir.
- − Um erro de política vaza dados → **teste automatizado de RLS obrigatório**:
  - `supabase/tests/rls_check.sql` percorre o catálogo e falha se alguma tabela de `public` estiver sem RLS ou se uma tabela com `org_id` não tiver fixture de teste.
  - Roda em todo `pnpm test:rls` (Postgres descartável com todas as migrations), com meta-testes que quebram uma policy de propósito para provar que o teste detecta.
  - `rls_check_remote.sql` roda no projeto real após cada migration.
- `service_role` (que ignora RLS) só existe no servidor (`lib/supabase/admin.ts`, `server-only`) e sempre filtra por `org_id` explicitamente.
