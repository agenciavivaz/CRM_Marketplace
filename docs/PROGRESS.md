# Progresso

Atualizado ao fim de cada fase. Plano e critérios de aceite: [PRD seção 16](PRD.md#16-plano-de-execução-por-fases).

| Fase                                   | Status                   |
| -------------------------------------- | ------------------------ |
| 0 — Fundação                           | ✅ Entregue (08/10/2026) |
| 1 — Bling                              | ⏳ Próxima               |
| 2 — Busca de WhatsApp, créditos e LGPD | —                        |
| 3 — WhatsApp                           | —                        |
| 4 — Réguas, listas e envios em massa   | —                        |
| 5 — Atribuição, dashboard e piloto     | —                        |
| 6 — P1                                 | —                        |

## Auditoria inicial (08/10/2026)

- **Repositório GitHub:** vazio (sem branches nem commits). Nenhum código anterior para aproveitar ou remover; confirmado com o Diego.
- **Supabase:** sem tabelas, migrations ou edge functions. Extensões `pgmq`, `pg_cron` e `pg_net` disponíveis (instaladas na Fase 1).
- **Vercel:** projeto `crmarketplace` criado, sem deploys.

## Fase 0 — Fundação

**Entregue**

- Next.js 15.5 + TypeScript strict (`noUncheckedIndexedAccess`) + Tailwind v4 + componentes shadcn/ui (Radix) + ESLint + Prettier + Vitest.
- Auth Supabase SSR: e-mail+senha e magic link; callback PKCE e `token_hash`; middleware que renova sessão e protege rotas.
- Migrations aplicadas no projeto:
  - `20261008190645_tenancy` — `organizations`, `memberships`, `platform_admins`, `audit_log`, RLS, RPC `create_organization`.
  - `20261008192524_private_helpers` — move `is_org_member`/`has_org_role`/`is_platform_admin`/`slugify` para o schema `private` (fora da API), corrigindo o alerta 0029 do advisor.
- Teste automatizado de RLS (local + variante remota executada no projeto: `RLS_OK`).
- Layout mobile-first: barra inferior + "Mais" no celular, sidebar no desktop, seletor de loja; todas as seções com os estados vazios da 14.5; configurações com as 8 subseções; admin da plataforma.
- `lib/crypto.ts`, `cpf.ts`, `phone.ts`, `names.ts`, `format.ts`, `logger.ts`, `copy/pt-BR.ts` com 37 testes unitários (+ 6 testes de banco/RLS) (incluindo glossário 14.2: falha se "lead", "opt-in" ou "enriquecimento" aparecerem na interface).
- 8 ADRs em `docs/adr/`.

**Decisões tomadas na fase**

- Push direto na `main` ao fim de cada fase, só com lint + typecheck + testes + build verdes (decisão do Diego).
- Fonte do sistema em vez de `next/font/google` (build não depende de rede externa).
- Nome do arquivo de migration = versão registrada no Supabase, para `supabase db push` futuro não reaplicar.
- Alerta restante do advisor (`create_organization` é `security definer` executável por `authenticated`) é intencional: é a única forma de criar loja e já valida `auth.uid()`.
- Validação ponta a ponta com o Supabase real fica no deploy: o container de desenvolvimento não alcança `*.supabase.co`.

## Divergências entre o PRD e a documentação oficial

Os domínios `developer.bling.com.br`, `directd.com.br` e `developers.facebook.com` não resolvem no ambiente de desenvolvimento. Até serem liberados, a fonte secundária para o Bling é o SDK `bling-erp-api@6.0.0` (tipos gerados da API v3):

| Tema                                        | PRD                                                 | Encontrado                                                                                                                                                                                                                      | Ação                                                                                              |
| ------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| URLs                                        | `api.bling.com.br/Api/v3`                           | API em `https://api.bling.com.br/Api/v3`; OAuth em `https://www.bling.com.br/Api/v3/oauth/{authorize,token}` com `Authorization: Basic base64(client_id:client_secret)`                                                         | Seguir o encontrado                                                                               |
| Pergunta 8: listagem de pedidos traz itens? | em aberto                                           | `GET /pedidos/vendas` **não** traz itens, mas traz `contato.numeroDocumento` (CPF/CNPJ), `contato.tipoPessoa`, `loja.id`, `total`, `situacao`, `numeroLoja`                                                                     | Etapa 3 da 10.4 continua; cliente já sai identificado da listagem (sem chamar contato por pedido) |
| Contatos                                    | —                                                   | `GET /contatos` traz `numeroDocumento`, `telefone`, `celular`; e-mail e endereço só no detalhe                                                                                                                                  | Cache de contatos da 10.4 usa a listagem                                                          |
| Assinatura do webhook                       | `X-Bling-Signature-256`                             | A confirmar na doc oficial (esperado: `sha256=` + HMAC-SHA256 hex do corpo bruto com o client secret)                                                                                                                           | Isolado em `lib/integrations/bling/webhook.ts` com teste                                          |
| Direct Data                                 | `GET apiv3.directd.com.br/api/CadastroPessoaFisica` | Central de ajuda mostra `TOKEN` como query param em toda chamada; exemplo do quickstart usa `/api/CadastroCpf`; resposta de exemplo traz `retorno.telefones[].{telefoneComDDD, tipoTelefone, whatsApp, telemarketingBloqueado}` | Confirmar rota exata antes da Fase 2                                                              |

## Variáveis de ambiente

Cadastre na Vercel (Settings → Environment Variables, ambiente **Production** e **Preview**). `NEXT_PUBLIC_*` entra no bundle no build: **depois de cadastrar, faça Redeploy**.

| Variável                                       | Quando                               | Valor                                                                           |
| ---------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                     | **Agora (Fase 0)**                   | `https://egwxlwtfeswnmpsmphip.supabase.co`                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                | **Agora**                            | Supabase → Project Settings → API Keys (publishable/anon)                       |
| `NEXT_PUBLIC_APP_URL`                          | **Agora**                            | URL de produção da Vercel, sem barra no fim                                     |
| `SUPABASE_SERVICE_ROLE_KEY`                    | **Agora** (usado a partir da Fase 1) | Supabase → API Keys (secret/service_role). Marcar como Sensitive                |
| `ENCRYPTION_KEY`                               | **Agora**                            | `openssl rand -base64 32` — Sensitive. Guarde uma cópia segura                  |
| `CPF_HASH_PEPPER`                              | **Agora**                            | `openssl rand -base64 32` — Sensitive. Não troque depois (muda todos os hashes) |
| `CRON_SECRET`                                  | **Agora**                            | `openssl rand -hex 32` — Sensitive                                              |
| `NEXT_PUBLIC_DEMO_MODE`                        | **Agora**                            | `true` (mostra o botão de dados de exemplo na Fase 1)                           |
| `ENRICHMENT_PROVIDER`                          | **Agora**                            | `mock`                                                                          |
| `MESSAGING_PROVIDER`                           | **Agora**                            | `mock`                                                                          |
| `BLING_CLIENT_ID`, `BLING_CLIENT_SECRET`       | Fase 1                               | App criado no Bling                                                             |
| `BLING_REDIRECT_URI`                           | Fase 1                               | `${NEXT_PUBLIC_APP_URL}/api/integrations/bling/callback`                        |
| `DIRECTDATA_TOKEN`                             | Fase 2 (piloto)                      | Painel Direct Data → Configurações → Integrações                                |
| `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN` | Fase 3                               | App da Meta                                                                     |

## Pendências com o Diego

- [ ] **GitHub → Settings → General → Default branch: trocar para `main`.** Como o repo estava vazio, a primeira branch enviada (`claude/eager-hopper-2cnxi7`) virou a padrão, e a Vercel está usando ela como produção. Até trocar, mantenho as duas branches no mesmo commit. Depois confira em Vercel → Settings → Git → Production Branch = `main`.
- [ ] O repositório está **público** (inclui o PRD). Se não for intencional: GitHub → Settings → Danger Zone → Change visibility → Private.

- [ ] Cadastrar as variáveis "Agora" na Vercel e fazer Redeploy.
- [ ] Supabase → Authentication → URL Configuration: Site URL = URL da Vercel; Redirect URLs = `https://<dominio>/auth/callback` e `https://<dominio>/auth/confirm`.
- [ ] Liberar `developer.bling.com.br`, `directd.com.br`, `developers.facebook.com` na rede do ambiente de desenvolvimento.
- [ ] Fase 1: criar app no Bling e enviar `BLING_CLIENT_ID`/`SECRET`.
- [ ] Para virar admin da plataforma: depois de criar a conta, me avise o e-mail (ou rode `insert into public.platform_admins (user_id) select id from auth.users where email = '…';`).
