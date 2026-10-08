# ADR-007: Atribuição por CPF, último toque, com holdout

**Status:** Aceito (holdout em P1) · **Data:** 08/10/2026

## Opções

| Opção                                                                     | Funciona em pedido de marketplace?                               | Confiabilidade               |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------- |
| **A. Novo pedido do mesmo CPF em janela após clique/leitura (escolhida)** | Sim (CPF vem na NF)                                              | Boa; superestima sem holdout |
| B. Cupom único por cliente                                                | Não (cupom não chega pelo marketplace ao ERP de forma confiável) | Alta onde funciona           |
| C. Só UTM                                                                 | Não                                                              | Baixa                        |

## Decisão

Conversão = novo pedido do mesmo cliente até 7 dias após clique ou 3 dias após leitura (configurável), último toque, em qualquer canal.

## Consequências

O dashboard mostra "Vendas geradas pelo CRM" até o holdout existir; com holdout, mostra o lift contra o "Grupo de comparação". Base para cobrança por sucesso no futuro.
