# ADR-005: Busca de WhatsApp com Direct Data atrás de adapter

**Status:** Aceito · **Data:** 08/10/2026

## Opções

| Opção                                                    | Contratação                          | Custo                                 | Retorno útil                                                            |
| -------------------------------------------------------- | ------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------- |
| **A. Direct Data (escolhida)**                           | Autosserviço, pré-pago, sem contrato | R$ 0,16/consulta (Cadastro PF Básica) | Telefones com flag WhatsApp, tipo, operadora, bloqueio de telemarketing |
| B. Bureaus com contrato (BigDataCorp, Assertiva, Neoway) | Comercial + contrato                 | Negociado                             | Geralmente mais profundo                                                |
| C. APIs que só verificam se um número tem WhatsApp       | Autosserviço                         | Baixo                                 | Não descobrem o número a partir do CPF                                  |

## Decisão

Interface `EnrichmentProvider` (`lib/enrichment/provider.ts`) com implementações `directdata` e `mock`, escolhida por `ENRICHMENT_PROVIDER`. Toda consulta grava `provider`, `provider_query_id`, data e custo. Minimização: só telefones, e-mails, cidade e UF são persistidos.

## Consequências

- \+ Começa hoje, sem time comercial.
- − Dependência de um fornecedor → adapter permite trocar ou combinar depois.
- Endpoint e parâmetros a confirmar na documentação técnica da Direct Data antes da Fase 2 (ver PROGRESS.md).
