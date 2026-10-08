# ADR-001: Monólito Next.js na Vercel com workers HTTP

**Status:** Aceito · **Data:** 08/10/2026 · **Decisor:** Diego

## Contexto

Um desenvolvedor com Claude Code, stack fixa (Next.js, Supabase, Vercel, GitHub) e MVP rápido. Precisamos de UI, webhooks e processamento assíncrono.

## Opções

| Opção                                             | Complexidade             | Custo | Escala | Familiaridade |
| ------------------------------------------------- | ------------------------ | ----- | ------ | ------------- |
| **A. Monólito Next.js (escolhida)**               | Baixa                    | Baixo | Média  | Alta          |
| B. Next.js + Supabase Edge Functions para workers | Média (Deno, 2 runtimes) | Baixo | Média  | Média         |
| C. Next.js + serviço Node separado (Railway)      | Alta                     | Médio | Alta   | Média         |

## Decisão

Um único app Next.js (App Router). Webhooks e workers são Route Handlers (`/api/webhooks/*`, `/api/workers/*`); o processamento assíncrono é acionado por `pg_cron` + `pg_net` chamando os workers com `Authorization: Bearer ${CRON_SECRET}`.

## Trade-off

A tem limite de tempo por execução e cold starts; compensado com lotes pequenos (≤ 50 mensagens) e idempotência em todo worker.

## Consequências

- \+ Um deploy, um repo, tipos compartilhados entre UI e workers.
- − Workers longos ficam fatiados em lotes encadeados.
- Revisitar quando o processamento por minuto passar de ~45 s ou > 300 sellers (ver PRD 10.10).

## Notas de implementação

- `NEXT_PUBLIC_*` é embutido no bundle no momento do build: mudar essas variáveis na Vercel exige novo deploy.
