# ADR-004: Identidade do cliente por CPF dentro de cada seller (sem identidade global)

**Status:** Aceito · **Data:** 08/10/2026

## Contexto

O mesmo CPF pode ser cliente de vários sellers da plataforma.

## Opções

| Opção                                    | Prós                                                | Contras                                                      |
| ---------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| **A. Chave `(org_id, cpf)` (escolhida)** | Cada seller é controlador distinto; alinhado à LGPD | Busca o mesmo CPF mais de uma vez na plataforma              |
| B. Pessoa global + vínculo por seller    | Economiza consultas; visão de rede                  | Cruzamento de bases entre controladores sem base legal clara |

## Decisão

`customers.identity_key` único por `org_id` (`cpf:<11 dígitos>` com confiança alta; fallback por e-mail ou nome+CEP com confiança baixa). Cache de busca de WhatsApp também é por seller.

## Consequências

Custo de dados um pouco maior; risco jurídico muito menor. Reavaliar só com parecer jurídico (PRD, pergunta 4).
