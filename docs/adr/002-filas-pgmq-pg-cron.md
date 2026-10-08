# ADR-002: Filas com Supabase Queues (pgmq) + pg_cron

**Status:** Aceito · **Data:** 08/10/2026

## Contexto

Webhooks precisam responder rápido (Bling exige < 5 s; meta interna < 2 s); o trabalho pesado vai para fila; réguas precisam de "esperar N dias".

## Opções

| Opção                                         | Complexidade    | Custo               | Escala                      | Familiaridade |
| --------------------------------------------- | --------------- | ------------------- | --------------------------- | ------------- |
| **A. pgmq + pg_cron + pg_net (escolhida)**    | Média           | Zero extra          | Média                       | Média         |
| B. Inngest (workflows duráveis, `step.sleep`) | Baixa no código | Grátis, depois pago | Alta                        | Baixa         |
| C. Upstash QStash                             | Baixa           | Por mensagem        | Alta                        | Baixa         |
| D. Só Vercel Cron                             | Baixa           | Zero                | Baixa (frequência limitada) | Alta          |

## Decisão

Filas `ingest`, `enrich`, `send`, `backfill` no pgmq (visibility timeout 60 s). `pg_cron` chama cada worker a cada minuto via `net.http_post`. `read_ct > 5` → `pgmq.archive` + `job_failures` + alerta no admin.

## Trade-off

A mantém fila e dados na mesma transação (enfileirar junto com o upsert) e não adiciona fornecedor; B é a melhor experiência para réguas complexas.

## Consequências

- \+ Tudo no Postgres, auditável por SQL.
- − Motor de régua escrito à mão.
- Revisitar com Inngest se o motor passar de ~5 tipos de passo ou se os workers ficarem frágeis.
