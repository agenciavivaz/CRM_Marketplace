# ADR-006: WhatsApp pela Cloud API oficial da Meta

**Status:** Aceito · **Data:** 08/10/2026

## Opções

| Opção                                                       | Risco de banimento                | Custo                    | Esforço                                          |
| ----------------------------------------------------------- | --------------------------------- | ------------------------ | ------------------------------------------------ |
| **A. Meta Cloud API, número do próprio seller (escolhida)** | Baixo (respeitando consentimento) | Tabela Meta por mensagem | Médio (seller cria WABA; MVP com conexão manual) |
| B. BSP (provedor oficial intermediário)                     | Baixo                             | Tabela Meta + taxa       | Baixo para o seller                              |
| C. Z-API / WhatsApp Web não oficial                         | Alto                              | Mensalidade fixa         | Baixo                                            |

## Decisão

Interface `MessagingProvider` com `meta_cloud` (padrão), `zapi` (atrás de feature flag, só testes internos) e `mock`, escolhida por `MESSAGING_PROVIDER`.

## Consequências

Onboarding de WhatsApp é a etapa mais difícil para o seller no MVP → tutorial forte (seção 14) e Embedded Signup em P2.
