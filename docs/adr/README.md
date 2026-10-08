# Decisões de arquitetura (ADRs)

Registradas a partir da seção 11 do [PRD](../PRD.md). Formato: contexto → opções → decisão → consequências.
Mudou uma decisão? Crie um ADR novo que substitui o anterior (não reescreva o histórico).

| #                                                | Decisão                                                | Status                 |
| ------------------------------------------------ | ------------------------------------------------------ | ---------------------- |
| [001](001-monolito-nextjs-vercel.md)             | Monólito Next.js na Vercel com workers HTTP            | Aceito                 |
| [002](002-filas-pgmq-pg-cron.md)                 | Filas com Supabase Queues (pgmq) + pg_cron             | Aceito                 |
| [003](003-multi-tenant-rls.md)                   | Multi-tenant em schema compartilhado com RLS           | Aceito                 |
| [004](004-identidade-por-cpf-por-seller.md)      | Identidade do cliente por CPF dentro de cada seller    | Aceito                 |
| [005](005-enriquecimento-direct-data-adapter.md) | Busca de WhatsApp com Direct Data atrás de adapter     | Aceito                 |
| [006](006-whatsapp-cloud-api.md)                 | WhatsApp pela Cloud API oficial da Meta                | Aceito                 |
| [007](007-atribuicao-por-cpf-holdout.md)         | Atribuição por CPF, último toque, com holdout          | Aceito (holdout em P1) |
| [008](008-criptografia-de-credenciais.md)        | Criptografia de credenciais na aplicação (AES-256-GCM) | Aceito                 |
