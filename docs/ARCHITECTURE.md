# Arquitetura — CRMarketplace

Resumo vivo do desenho. Fonte da verdade do produto: [PRD.md](PRD.md) (seções 10–13). Decisões: [adr/](adr/README.md).

## Visão geral

```
Vercel (Next.js 15, App Router)                     Supabase
├─ UI: Server Components + Server Actions  ───────▶ Postgres + RLS (org_id)
├─ /api/webhooks/{bling,whatsapp}  ──grava+enfileira▶ pgmq: ingest · enrich · send · backfill
├─ /api/integrations/bling/{authorize,callback}      pg_cron + pg_net (a cada 1 min)
└─ /api/workers/*  ◀──────── Bearer CRON_SECRET ────
        │
        ├─▶ Bling API v3        (Fase 1)
        ├─▶ Direct Data         (Fase 2)
        └─▶ Meta Cloud API      (Fase 3)
```

## Camadas do código

| Pasta                                               | O quê                                                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `app/(auth)`                                        | login, cadastro (e-mail+senha e magic link), `auth/callback` e `auth/confirm`                                        |
| `app/onboarding/org`                                | criação da loja (RPC `create_organization`)                                                                          |
| `app/(app)/[org]/…`                                 | área da loja; o layout carrega a org pelo slug e confere vínculo (`requireOrg`)                                      |
| `app/admin`                                         | painel da plataforma (só `platform_admins`)                                                                          |
| `components/ui`                                     | primitivos no padrão shadcn/ui (Radix + Tailwind v4)                                                                 |
| `lib/copy`                                          | **todo** texto visível (seção 14) — `copy.*` e `fmt()`                                                               |
| `lib/supabase`                                      | `server.ts` (sessão do usuário, RLS), `client.ts` (browser), `admin.ts` (service role, só servidor), `middleware.ts` |
| `lib/auth.ts`                                       | `requireUser`, `requireOrg`, `listMyOrgs`, `isPlatformAdmin`, `canManage`                                            |
| `lib/{crypto,cpf,phone,names,format,logger,env}.ts` | utilitários com testes em `tests/unit`                                                                               |
| `supabase/migrations`                               | migrations versionadas (o nome do arquivo = versão aplicada no projeto)                                              |
| `supabase/tests`                                    | teste de RLS em SQL (local e remoto)                                                                                 |
| `tests/unit`, `tests/db`                            | Vitest: unitários e banco (Postgres descartável)                                                                     |

## Multi-tenant e autorização

- Toda tabela de negócio: `org_id` + RLS via `private.is_org_member(org_id)` / `private.has_org_role(org_id, roles)`.
- Papéis: `owner` (cria a loja; único que gerencia papéis), `admin`, `member`. `audit_log` só para owner/admin.
- O schema `private` não é exposto pela API REST; só `create_organization` é RPC pública.
- `anon` não tem privilégio em nenhuma tabela.
- Mutações da UI: Server Actions com Zod + checagem de papel (`canManage`) **além** da RLS.

## Segurança (seção 15)

- Tokens de integração: AES-256-GCM (`lib/crypto.ts`, ADR-008).
- CPF: mascarado na UI (`maskCpf`), `hashCpf` (HMAC + pepper) em logs/consultas; `lib/logger.ts` redige CPF, CNPJ, telefone, e-mail e tokens de qualquer log.
- Middleware protege tudo, exceto `/`, `/login`, `/signup`, `/auth/*`, `/p/*`, `/c/*`, `/r/*` e `/api/*` (webhooks e workers têm autenticação própria).
- Cabeçalhos: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`.

## Como rodar

```bash
pnpm install
cp .env.example .env.local   # preencha
pnpm dev
pnpm check                   # lint + typecheck + test + test:rls + build
```

`pnpm test:rls` sobe um Postgres local (binários em `/usr/lib/postgresql/*/bin` ou `PG_BIN`), aplica `tests/db/supabase-shim.sql` + todas as migrations e roda `supabase/tests/rls_check.sql`. Alternativa: `DATABASE_URL_TEST=postgres://…`.

## Migrations

1. Escreva `supabase/migrations/<versão>_<nome>.sql`.
2. `pnpm test:rls` (inclua a fixture da tabela nova em `supabase/tests/rls_check*.sql`).
3. Aplique no projeto (MCP `apply_migration` ou `supabase db push`) e renomeie o arquivo para a versão registrada.
4. Rode `supabase/tests/rls_check_remote.sql` no projeto e os advisors de segurança.
5. Regere `lib/supabase/database.types.ts`.
