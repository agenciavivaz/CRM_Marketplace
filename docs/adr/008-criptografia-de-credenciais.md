# ADR-008: Criptografia de credenciais na aplicação (AES-256-GCM)

**Status:** Aceito · **Data:** 08/10/2026

## Opções

| Opção                                                            | Prós                                     | Contras                                        |
| ---------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| **A. AES-GCM no app com `ENCRYPTION_KEY` na Vercel (escolhida)** | Simples, testável, independente do banco | Rotação de chave manual                        |
| B. Supabase Vault                                                | Gerenciado no banco                      | Acesso via SQL com service role; mais acoplado |

## Decisão

`lib/crypto.ts`: `encrypt`/`decrypt` com AES-256-GCM, IV aleatório de 12 bytes, formato `v1:<iv>:<tag>:<ciphertext>` (base64url). Tokens do Bling e da Meta são gravados só cifrados em `integrations.credentials_encrypted` e nunca vão para log nem para o client. CPF em logs e consultas usa `hashCpf` (HMAC-SHA256 com `CPF_HASH_PEPPER`).

## Rotação de chave (`rotateKey`)

1. Gerar nova chave: `openssl rand -base64 32`.
2. Cadastrar como `ENCRYPTION_KEY_NEXT` na Vercel.
3. Rodar o script de rotação (a criar junto com a primeira integração, Fase 1): para cada linha de `integrations`, `rotateKey(valor, chaveAtual, chaveNova)` dentro de transação.
4. Trocar `ENCRYPTION_KEY` pela nova, remover `ENCRYPTION_KEY_NEXT` e fazer redeploy.

## Consequências

Chave nunca no repo. Perder a chave = reconectar integrações (os tokens são recuperáveis por novo OAuth).
