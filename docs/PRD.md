# PRD — CRMarketplace v2
**O primeiro CRM dedicado a quem vende em marketplace**

| | |
|---|---|
| **Autor** | Diego Rosa Rodrigues (Vivaz) |
| **Versão** | 2.0 — 08/10/2026 (substitui a v1) |
| **Status** | Pronto para desenvolvimento (MVP) |
| **Repo** | https://github.com/agenciavivaz/CRM_Marketplace |
| **Supabase** | https://egwxlwtfeswnmpsmphip.supabase.co |
| **Vercel** | projeto `crmarketplace` — deploy automático a cada push na `main` |
| **Stack** | Claude Code · Next.js 15 (App Router, TypeScript) · Supabase · Vercel · GitHub |
| **Métodos usados** | `/product-management:brainstorm` · `/product-management:competitive-brief` · `/engineering:system-design` · `/engineering:architecture` (ADRs) · `/design:ux-copy` |

> **Para o Claude Code:** este documento é a fonte da verdade. Seções 2–4 explicam o *porquê*; 6–9 o *quê*; 10–12 o *como* (system design, ADRs, dados); 14 todo o texto da interface e das mensagens (use exatamente esses textos); 16 as fases com critérios de aceite. Trabalhe fase por fase. Cada push na `main` faz deploy — **nunca faça push com build quebrado**.

---

## Sumário
1. Resumo executivo
2. Brainstorm estratégico — a tese do produto
3. Problema e oportunidade
4. Competitive brief
5. Objetivos, não-objetivos e métricas
6. Personas e user stories
7. A feature core: Captura → Enriquecimento → Relacionamento
8. Requisitos funcionais (P0 / P1 / P2)
9. Conformidade: LGPD, WhatsApp e marketplaces
10. System design
11. Decisões de arquitetura (ADRs)
12. Modelo de dados
13. Integrações externas
14. UX e copy
15. Segurança
16. Plano de execução por fases
17. Riscos e mitigação
18. Perguntas em aberto
19. Fontes

---

## 1. Resumo executivo

**O que é:** um CRM que se conecta ao ERP do seller (Bling na v1), transforma cada nota fiscal emitida em um cliente identificado por CPF, encontra o WhatsApp dele por enriquecimento de dados e roda réguas de pós-venda e recompra — medindo quanto de receita voltou.

**Por que agora:** o seller de marketplace paga comissão e anúncio a cada venda e não é dono do cliente. O marketplace esconde o comprador, mas a nota fiscal não: ela traz nome completo e CPF, e o ERP junta os compradores de todos os canais num lugar só.

**Aposta central (saída do brainstorm):** *o diferencial não é "achar o WhatsApp" — isso é copiável. O fosso é a combinação de identidade única por CPF entre canais + régua "opt-in primeiro" + reposição prevista por produto + atribuição de receita com grupo de controle.* O enriquecimento é o acelerador que faz isso funcionar desde o primeiro dia.

**Posicionamento:** "Venda de novo para quem já comprou de você — em qualquer marketplace."

---

## 2. Brainstorm estratégico — a tese do produto
*Método: `/product-management:brainstorm` — enquadrar, divergir, provocar, convergir, registrar.*

### 2.1 Enquadramento
- **Pergunta:** como fazer o seller de marketplace vender mais usando os dados que ele já tem no ERP, sem colocar a conta dele em risco no marketplace?
- **O que já sabemos:** o ERP tem nome + CPF de todo comprador; marketplaces restringem o uso desses dados e punem desvio de venda; WhatsApp exige opt-in para mensagens iniciadas pela empresa; LGPD admite enriquecimento com finalidade e rastreabilidade.
- **Bom resultado:** uma tese que gere receita mensurável para o seller e que ele consiga usar sem medo.

### 2.2 Divergir — ideias na mesa
| # | Ideia | Comentário rápido |
|---|---|---|
| 1 | **Segunda venda fora do marketplace** (tese original) | Margem maior para o seller, mas é exatamente o que ML e Shopee punem. |
| 2 | **Recompra dentro do marketplace** — CTA leva para a loja do seller no ML/Shopee | Menos margem, risco muito menor, ainda é "vender mais". |
| 3 | **Reposição prevista por SKU** — avisar quando o produto deve acabar | Alto valor para consumíveis (cosmético, pet, suplemento, filtro, refil). |
| 4 | **Pós-venda que protege reputação** — "chegou bem?" antes do cliente reclamar no marketplace | Reduz mediação/reclamação; reputação vira mais venda. |
| 5 | **QR code na embalagem** gerado pelo CRM ("ative sua garantia / ganhe um cupom") | Captura opt-in de primeira mão, **custo zero de enriquecimento**. |
| 6 | **Registro de garantia/produto** como isca de opt-in | Variante do #5 com motivo forte para o cliente se cadastrar. |
| 7 | **Cross-sell** — "quem comprou X costuma comprar Y" | Usa o histórico do próprio seller. |
| 8 | **Aviso de volta ao estoque** para quem já comprou | Gatilho do webhook de estoque do Bling. |
| 9 | **Audiências para Ads** (Meta/Google) a partir de segmentos | Monetiza a base sem mensagem direta. |
| 10 | **Clube VIP / cashback** na loja própria | Útil para sellers com e-commerce próprio. |

### 2.3 Provocar — premissas desafiadas
1. **"O enriquecimento é o diferencial."** → Não é. Qualquer concorrente pluga uma API de R$ 0,16 em uma semana. Ele é também a parte mais arriscada (LGPD, número errado, contato frio). **Posição:** tratar enriquecimento como acelerador e investir o fosso em identidade por CPF, previsão de recompra e atribuição.
2. **"A promessa é vender fora do marketplace."** → Vender essa promessa é pedir para o cliente correr risco de punição. **Reenquadrar:** "venda de novo para quem já comprou de você, onde ele preferir comprar". O seller escolhe o destino; o padrão é seguro.
3. **"Mandar oferta no WhatsApp gera venda."** → Mandar oferta fria para número enriquecido gera bloqueio, queda de qualidade do número e denúncia. **Posição:** a primeira mensagem é utilidade sobre o pedido real e pede permissão. A base com opt-in é o ativo que o seller leva.
4. **"Cobrar % da receita gerada é risco zero e vende sozinho."** → Só funciona se o seller confiar na atribuição. Sem grupo de controle, todo seller vai dizer "esse cliente ia comprar de qualquer jeito". **Posição:** atribuição por CPF desde o MVP e holdout logo em seguida (P1), antes de qualquer modelo de comissão.
5. **"15 minutos para ver a base."** → O system design mostra que o histórico completo de um seller médio leva horas por causa do limite de 3 req/s do Bling (seção 10.4). **Posição:** prometer "primeiros clientes em minutos, histórico completo em segundo plano".

### 2.4 Convergir — direção escolhida
**Retenção multicanal com opt-in primeiro.** Quatro peças que só fazem sentido juntas:
1. Identidade única por CPF entre todos os canais (vem do ERP).
2. Régua de pós-venda de utilidade + pedido de permissão (constrói a base com opt-in).
3. Reposição prevista por SKU e reativação (gera a recompra).
4. Atribuição por CPF com grupo de controle (prova o retorno).

O QR code na embalagem (#5) entra em P1 como **segundo canal de captura**, sem custo de dados e com opt-in nativo.

### 2.5 Registro
- **Premissa mais arriscada:** números obtidos por enriquecimento + primeira mensagem de utilidade geram taxa de opt-in aceitável **sem** derrubar a qualidade do número no WhatsApp e sem gerar punição no marketplace.
- **Próximo passo recomendado (antes de terminar a Fase 3):** teste concierge com 2 sellers — exportar 200 CPFs do Bling, enriquecer pelo painel da Direct Data (~R$ 32), enviar manualmente a mensagem de pós-venda para 50 contatos via Cloud API, medir: % com WhatsApp, % entregue, % opt-in, % bloqueio. Custo total < R$ 100; resposta em 1 semana.
- **Ideias estacionadas:** chatbot de IA no atendimento, audiências de Ads, cashback, integração direta com APIs dos marketplaces, aviso de volta ao estoque.

---

## 3. Problema e oportunidade

- O seller **não é dono do relacionamento**: o marketplace controla o canal, mascara contatos e pune desvio.
- A base existe (milhares de CPFs nas notas) mas está **parada no ERP**: sem telefone útil, sem segmentação, sem histórico consolidado entre canais.
- O ERP resolve pedido, nota e estoque, não relacionamento — avaliações de usuários do Bling pedem integração com CRM.
- Resultado: cada venda é tratada como a última; o seller paga comissão e anúncio de novo para reconquistar quem já comprou.

**Desafios de gestão que viram feature:**
1. Visão única do cliente (o mesmo CPF compra no ML e na Shopee).
2. Saber quem vale mais (RFM, LTV, recência).
3. Saber a hora certa da recompra (ciclo por produto).
4. Pós-venda proativo que protege reputação.
5. Provar retorno de qualquer ação de relacionamento.

---

## 4. Competitive brief
*Método: `/product-management:competitive-brief`. Pesquisa em fontes públicas em 08/10/2026. Avaliações abaixo são baseadas em material público, não em uso dos produtos — revisar trimestralmente.*

### 4.1 Mapa competitivo
| Nível | Quem | Por que importa |
|---|---|---|
| **Direto** | Segunda Venda | Mesma promessa (segunda venda para sellers). |
| **Indireto** | SocialHub, Reportana, Kommo, RD Station (+ Pluga) | Resolvem relacionamento/WhatsApp, mas para outro contexto (atendimento, loja própria, funil de vendas). |
| **Adjacente** | **Bling** (pode construir nativamente), BSPs de WhatsApp, hubs de integração de marketplace | Têm a base de clientes e a distribuição; um movimento deles muda o jogo. |
| **Substitutos** | WhatsApp Web + extensões (ex.: WaSeller, ~100 mil usuários), planilha exportada do Bling, não fazer nada | É contra isso que a maioria dos sellers PME compara na prática. |

**Eixos que revelam o posicionamento:** *horizontal ↔ vertical (marketplace)* e *atendimento/funil ↔ retenção/recompra*. Todos os players conhecidos estão no quadrante horizontal + atendimento/funil. **O quadrante vertical + retenção está vazio de produto self-service** — com exceção da Segunda Venda, que hoje vende de forma consultiva.

### 4.2 Perfis
**Segunda Venda** — *Para sellers que querem recomprar o cliente fora do marketplace.* A landing atual é só um agente de IA ("Sarah") para agendar conversa com o time: venda consultiva, sem preço nem produto visíveis.
- Forças: tese idêntica validada no mercado; venda assistida pode converter tickets maiores.
- Fraquezas: zero self-service; promessa "fora do marketplace" carrega o risco de política; pouca transparência.

**SocialHub** — *"Plataforma brasileira de WhatsApp para PMEs"*: CRM com Kanban, chatbot IA, automações multicanal, help desk e integrações nativas com Bling, Tiny, ASAAS, Nuvemshop e Hotmart, de R$ 99 a R$ 399/mês, dizendo ter 15 mil empresas ativas. Produz bastante conteúdo para sellers de ML/Shopee.
- Forças: preço acessível, API oficial, integração com Bling, conteúdo SEO forte no nosso nicho.
- Fraquezas: produto de atendimento/funil; não há evidência pública de identidade por CPF, enriquecimento a partir da nota ou previsão de recompra.

**Reportana** — automação de comunicação para e-commerce (WhatsApp API oficial, e-mail, SMS, ligação, chatbot), a partir de US$ 19/mês na Shopify.
- Forças: multicanal, API oficial, recuperação de carrinho madura.
- Fraquezas: centrada em loja própria (Shopify/Nuvemshop/Woo); não usa ERP como fonte nem atende comprador de marketplace.

**Kommo** — integração oficial com Bling para importar produtos e gerar pedidos a partir do card do lead.
- Forças: CRM de funil conhecido, integração oficial.
- Fraquezas: fluxo é CRM → ERP (vender); o nosso é ERP → CRM (reter). Não é feito para base de compradores.

**RD Station + Pluga** — cria ou atualiza lead no RD quando um pedido muda de status no Bling.
- Forças: marca forte, automação de marketing completa.
- Fraquezas: genérico, caro para PME de marketplace, sem WhatsApp nativo nem modelo de comprador de marketplace.

**Bling (adjacente)** — ERP com integrações nativas com marketplaces e logística; já tem conector MCP oficial para IA.
- Leitura: está investindo em camada de IA/integrações. É o player que mais pode nos ameaçar — e o melhor parceiro de distribuição.

### 4.3 Matriz de capacidades
Escala: **Forte** · **Adequado** · **Fraco** · **Ausente** · **?** (sem evidência pública)

| Capacidade | **CRMarketplace (alvo MVP)** | Segunda Venda | SocialHub | Reportana | Kommo | RD + Pluga |
|---|---|---|---|---|---|---|
| ERP (Bling) como fonte de compradores | Forte | ? | Adequado | Ausente | Adequado | Adequado |
| Identidade única por CPF entre canais | Forte | ? | ? | Ausente | Ausente | Ausente |
| Enriquecimento CPF → WhatsApp | Forte | ? | ? | Ausente | Ausente | Ausente |
| WhatsApp API oficial | Adequado | ? | Forte | Forte | Adequado | Fraco |
| Chatbot / atendimento | Fraco (inbox P1) | ? | Forte | Forte | Forte | Fraco |
| Régua de pós-venda e recompra | Forte | ? | Adequado | Adequado | Fraco | Adequado |
| Reposição prevista por SKU | Forte | ? | ? | ? | Ausente | Ausente |
| Segmentação RFM | Adequado | ? | ? | ? | Fraco | Adequado |
| Atribuição de receita (com holdout em P1) | Forte | ? | ? | Adequado | Fraco | Adequado |
| Opt-in/LGPD embutido no fluxo | Forte | ? | ? | ? | ? | Adequado |
| Self-service (sem time comercial) | Forte | Ausente | Forte | Forte | Forte | Adequado |

**Leitura honesta:** perdemos em atendimento/chatbot e em maturidade de produto. Isso é escolha, não falha — não vamos competir ali no MVP.

### 4.4 Posicionamento
| Player | Categoria que reivindica | Diferencial declarado | Promessa |
|---|---|---|---|
| Segunda Venda | Recompra para sellers | Venda fora do marketplace | Mais margem |
| SocialHub | Plataforma de WhatsApp para PME | Tudo em um + IA | Vender e atender pelo WhatsApp |
| Reportana | Automação de e-commerce | Multicanal + API oficial | Recuperar vendas da loja |
| Kommo | CRM de mensageria | Funil no chat | Fechar mais negócios |
| **CRMarketplace** | **CRM de marketplace** | **Base unificada por CPF + recompra prevista + prova de retorno** | **Venda de novo para quem já comprou de você** |

- **Posição não reivindicada:** "CRM vertical de marketplace com prova de retorno". Ninguém fala de lift contra grupo de controle para PME.
- **Posição saturada:** "WhatsApp + IA para vender mais" — todo mundo diz.
- **Posição vulnerável (do benchmark direto):** "venda fora do marketplace" — difícil de entregar sem risco para o cliente.

### 4.5 Oportunidades
1. Self-service onde o concorrente direto é consultivo.
2. Conteúdo sobre "como recomprar sem ser punido" — o medo do seller é real e mal respondido.
3. Previsão de recompra por SKU: nenhum player mostra isso publicamente.
4. Listagem na loja de aplicativos do Bling como canal de aquisição.

### 4.6 Ameaças
1. **Cenário-pesadelo:** o Bling lança um módulo nativo de relacionamento com WhatsApp para a própria base. *Resposta:* ser o parceiro antes (app na loja do Bling), e ganhar em profundidade de marketplace e multi-ERP.
2. Marketplaces endurecerem: mascarar CPF/nome na NF ou fiscalizar uso pós-venda. *Resposta:* canal de captura próprio (QR na embalagem, P1) que não depende do CPF.
3. SocialHub adicionar enriquecimento + reposição — tem distribuição e conteúdo. *Resposta:* velocidade e foco vertical.
4. Meta aumentar preço de marketing no Brasil ou a ANPD agir contra bureaus de enriquecimento. *Resposta:* mensagens de utilidade, adapter de provedor, base com opt-in.

### 4.7 Implicações estratégicas
- **Diferenciar:** identidade por CPF, reposição por SKU, atribuição + holdout, compliance embutido, onboarding em minutos.
- **Paridade mínima:** WhatsApp API oficial, templates, segmentação básica, dashboard.
- **Não competir (por enquanto):** chatbot, help desk, funil de vendas.
- **Mensagem:** trocar "venda fora do marketplace" por "venda de novo para quem já comprou de você — sem arriscar sua conta".
- **Monitorar (mensal):** changelog e blog do Bling e do SocialHub, página da Segunda Venda, políticas de vendedor do ML/Shopee, tabela de preços da Meta para o Brasil.

---

## 5. Objetivos, não-objetivos e métricas

### Objetivos do MVP
1. **Ativação:** primeiros clientes visíveis em **< 15 min** após conectar o Bling; últimos 90 dias completos em **< 2 h** para um seller com até 3 mil pedidos/mês.
2. **Enriquecimento:** WhatsApp encontrado para **≥ 60%** dos CPFs elegíveis (hipótese).
3. **Base própria:** **≥ 25%** de opt-in na mensagem de pós-venda (hipótese).
4. **Receita:** lift de recompra positivo vs. grupo de controle em 60 dias, em 3 a 5 sellers piloto.
5. **Unit economics:** ROI ≥ 5x (receita atribuída ÷ custo de dados + mensagens).

### Não-objetivos (v1)
- Outros ERPs (a arquitetura de conectores suporta; só Bling agora).
- APIs diretas de marketplaces (o ERP já consolida pedidos).
- Chatbot de IA e help desk (inbox simples em P1).
- E-mail e SMS (WhatsApp primeiro).
- Checkout automático de assinatura (piloto com recarga manual de créditos).

### Métricas
| Tipo | Métrica | Meta piloto |
|---|---|---|
| Curto prazo | % CPFs elegíveis com WhatsApp | ≥ 60% |
| Curto prazo | Taxa de entrega WhatsApp | ≥ 95% |
| Curto prazo | Opt-in na mensagem de pós-venda | ≥ 25% |
| Curto prazo | Opt-out + bloqueio | < 3% |
| Curto prazo | Qualidade do número (Meta) | sempre verde |
| Médio prazo | Lift de recompra vs. holdout (60 dias) | positivo e consistente |
| Médio prazo | ROI | ≥ 5x |
| Médio prazo | Sellers piloto ativos após 60 dias | ≥ 3 de 5 |

**Conta de padaria (hipótese):** por cliente ≈ R$ 0,16 (dados) + R$ 0,035 (pós-venda utility) + 2 × R$ 0,32 (marketing, só com opt-in) ≈ **R$ 0,84**. Ticket R$ 150 e 5% de recompra atribuída → R$ 7,50 por cliente ≈ **9x**.

---

## 6. Personas e user stories

- **A — Dono(a) da operação:** fatura R$ 50 mil a R$ 1 mi/mês em 2+ marketplaces, usa Bling, resolve tudo no celular, não tem time de CRM.
- **B — Operador(a) de marketing/atendimento do seller.**
- **C — Admin da plataforma (Diego).**
- **D — Cliente final** (recebe as mensagens).

**Onboarding**
- Como dono, quero conectar meu Bling em um clique para não exportar planilha.
- Como dono, quero ver meus clientes de todos os marketplaces numa lista só.
- Como dono, quero nomear meus canais ("Loja 123" = "Mercado Livre") para filtrar por origem.

**Enriquecimento**
- Como dono, quero que cada cliente novo ganhe WhatsApp automaticamente.
- Como dono, quero limitar quanto gasto (valor mínimo do pedido, limite diário).
- Como dono, quero ver saldo de créditos e o custo de cada consulta.

**Relacionamento**
- Como dono, quero ligar réguas prontas (pós-venda, reposição, reativação) sem desenhar do zero.
- Como operador, quero criar segmentos e enviar uma campanha sabendo o custo antes.
- Como operador, quero ver quem respondeu.
- Como cliente final, quero parar de receber mensagens com uma palavra e ser respeitado na hora.

**Resultado**
- Como dono, quero ver quanto vendi de novo por causa do CRM e quanto custou.

**Admin**
- Como admin, quero recarregar créditos e ver a saúde das integrações de todos os sellers.

**Casos de borda**
- Pedido com CNPJ → não enriquecer.
- CPF ausente/inválido → cliente criado sem enriquecimento, sinalizado.
- Nome retornado ≠ nome da nota → "confiança baixa", fora das réguas automáticas.
- Pedido cancelado → não entra em régua; se já entrou, sai.
- Bling desconectado → banner de reconexão; eventos continuam sendo aceitos e enfileirados.
- Nome em caixa alta na nota ("MARIA SILVA SANTOS") → usar só o primeiro nome em formato título ("Maria").

---

## 7. A feature core: Captura → Enriquecimento → Relacionamento

```
 Marketplaces (ML, Shopee, Amazon, Magalu…)
          │ pedido
          ▼
 ┌──────────────────┐  webhook order/invoice   ┌──────────────────────────────┐
 │   Bling (ERP)    │ ───────────────────────▶ │ /api/webhooks/bling           │
 │ pedido + NF-e    │                          │ HMAC → grava → fila → 200 <2s │
 └──────────────────┘◀── GET pedido/contato ── └──────────────┬───────────────┘
                                                              ▼ fila "ingest"
                                              ┌───────────────────────────────┐
                                              │ Ingestão: upsert pedido/itens,│
                                              │ resolve cliente por CPF,      │
                                              │ recalcula métricas e RFM      │
                                              └──────────────┬────────────────┘
                                                             ▼ fila "enrich"
                                              ┌───────────────────────────────┐
                                              │ Enriquecimento: regras, cache,│
                                              │ débito de crédito, Direct Data│
                                              │ escolhe WhatsApp, confere nome│
                                              └──────────────┬────────────────┘
                                                             ▼
                                              ┌───────────────────────────────┐
                                              │ Réguas: pós-venda + opt-in →  │
                                              │ reposição → reativação        │
                                              └──────────────┬────────────────┘
                                                             ▼ fila "send"
                                              WhatsApp Cloud API → cliente
                                                             │ clique / resposta / nova compra
                                                             ▼
                                              Atribuição por CPF → Dashboard
```

### 7.1 Regras do enriquecimento
1. **Gatilho:** cliente PF novo com CPF válido, ou telefone verificado há mais de 180 dias.
2. **Atalho grátis:** se o contato do Bling já tem celular válido e não mascarado, usa (`source = erp`) sem gastar crédito.
3. **Elegibilidade configurável:** pedido não cancelado · valor mínimo · limite diário · saldo suficiente · canal habilitado.
4. **Cache por seller de 180 dias:** o provedor cobra cada consulta, mesmo repetida.
5. **Escolha do número:** `CELULAR` + `whatsApp = true` + `telemarketingBloqueado = false`; nenhum com WhatsApp → `no_whatsapp`.
6. **Conferência de identidade:** similaridade entre nome retornado e nome da nota (normalizado). Abaixo de 0,8 → `low_confidence`.
7. **Minimização:** guardar só telefones, e-mails, cidade e UF. Descartar nome da mãe, renda, nascimento, signo e o resto.
8. **Rastreabilidade:** provedor, ID da consulta, data e custo.

### 7.2 Régua "opt-in primeiro"
A primeira mensagem é sempre de **utilidade sobre o pedido real** e pede permissão (texto final na seção 14.7). Botão "Quero receber" → `opted_in` (marketing liberado). "Não, obrigado" ou palavra de saída → `opted_out`. Sem resposta → `transactional_only` (só avisos de pedido).

---

## 8. Requisitos funcionais

### P0 — MVP

**R1. Contas e multi-tenant** — Supabase Auth (e-mail+senha, magic link); organização com papéis `owner`/`admin`/`member`; RLS por `org_id`.
*Aceite:* teste automatizado prova que um usuário não lê nem escreve dados de outra org.

**R2. Conexão Bling (OAuth v3)** — authorization code com `state`; tokens criptografados; `companyId` salvo; refresh automático com lock; `needs_reauth` + banner se falhar.
*Aceite:* conectar, desconectar e reconectar; tokens nunca em log nem no client.

**R3. Webhooks em tempo real** — `POST /api/webhooks/bling` para `order.*`, `invoice.*`, `consumer_invoice.*`; valida `X-Bling-Signature-256`; idempotência por `eventId`; resposta 2xx em < 2s; processamento fora de ordem seguro.
*Aceite:* pedido criado no Bling aparece no CRM em < 2 min.

**R4. Importação de histórico** — progressiva (mais recente primeiro: 30 → 90 → 365 dias), retomável, respeita 3 req/s e 120k/dia, backoff em 429.
*Aceite:* 5.000 pedidos importados sem duplicar e sem 429 em loop; interrupção retoma do cursor.

**R5. Clientes 360** — identidade por CPF normalizado com DV; fallback por e-mail ou nome+CEP com confiança baixa; ficha com canais, pedidos, itens, LTV, ticket, RFM, telefones (com origem), consentimento e timeline.
*Aceite:* mesmo CPF em 2 canais = 1 cliente com 2 pedidos.

**R6. Canais de venda** — `loja.id` do pedido → nome do canal editável; sem loja = "Venda direta".

**R7. Métricas** — `customer_metrics` (pedidos, total, ticket, primeira/última compra, recência, intervalo médio, RFM em quintis por seller, segmento, próxima compra prevista) e `product_cycles` (mediana de dias entre recompras do SKU, mínimo 5 amostras).

**R8. Enriquecimento** — regras da 7.1; provider plugável (`directdata`, `mock`); configurações; re-enriquecer com confirmação de custo.
*Aceite:* CPF consultado há < 180 dias não gera cobrança; CNPJ nunca vai ao provedor; campos descartados não são persistidos.

**R9. Créditos** — carteira por org; ledger imutável; preço de venda configurável (sugestão R$ 0,30) e custo real (R$ 0,16); saldo zero pausa enriquecimento; recarga manual pelo admin.

**R10. WhatsApp** — provider plugável (`meta_cloud` recomendado; `zapi` atrás de flag; `mock`); conexão manual (`phone_number_id`, `waba_id`, token de usuário de sistema) com tutorial; sync de templates com categoria e custo; webhook de status e entrada; opt-in/opt-out por botão e palavras (`SAIR`, `PARAR`, `CANCELAR`, `STOP`).
*Aceite:* entrega em número de teste; status atualizado; "SAIR" bloqueia marketing em < 1 min.

**R11. Réguas** — editor de passos verticais; gatilhos `order_invoiced`, `days_after_purchase`, `predicted_repurchase`, `inactive_days`, `segment_entry`; passos `wait`, `condition`, `send_template`, `add_tag`, `exit`; regras globais (janela 9h–20h America/Sao_Paulo, 1 mensagem de marketing a cada 7 dias por cliente, saída por compra e opt-out, marketing só com opt-in); 3 réguas prontas.
*Aceite:* teste com relógio simulado percorre a régua; nenhuma mensagem de marketing sai sem opt-in.

**R12. Segmentos e campanhas** — regras AND/OR sobre RFM, recência, pedidos, LTV, ticket, canal, SKU, UF/cidade, WhatsApp, consentimento, tags; contagem ao vivo; campanha agora ou agendada com custo estimado antes de confirmar.

**R13. Links e atribuição** — todo link vira `/r/{code}`; destino padrão = loja do seller no marketplace; conversão = novo pedido do mesmo CPF até 7 dias após clique ou 3 dias após leitura (configurável), último toque, em qualquer canal.
*Aceite:* pedido de CPF que clicou vira conversão ligada à mensagem certa.

**R14. Dashboard** — KPIs, funil (enriquecido → contatado → opt-in → clicou → comprou), receita por semana, RFM, custo e ROI.

**R15. LGPD operacional** — base legal e evidência por contato/canal; página pública `/p/{slug}` com aviso e formulário de saída; exportar/excluir cliente; log de auditoria.

**R16. Admin** — orgs, saldos, consumo, recarga, saúde de integrações e filas.

### P1 — Logo após o MVP
- **Grupo de controle (holdout)** por régua (padrão 10%).
- **QR code na embalagem:** página `/c/{slug}` onde o cliente informa nº do pedido + WhatsApp e aceita receber mensagens (opt-in de primeira mão, sem custo de dados).
- Inbox (responder dentro da janela de 24h).
- Gerador de texto de template com IA.
- Recarga de créditos via PIX (Abacate Pay ou Stripe).
- E-mail (Resend).
- Pesquisa pós-entrega (NPS).

### P2 — Futuro (não bloquear no desenho)
- Conectores Tiny/Olist ERP, Omie.
- Embedded Signup da Meta como Tech Provider.
- Previsão de churn com modelo.
- Audiências para Meta/Google Ads.
- Aviso de volta ao estoque (webhook `stock` do Bling).
- Cobrança por sucesso (% da receita atribuída).

---

## 9. Conformidade: LGPD, WhatsApp e marketplaces

### 9.1 LGPD
- Seller = **controlador**; CRMarketplace = **operador**. Termos de uso + DPA explícitos.
- Base legal sugerida: legítimo interesse para comunicação com quem já comprou (com LIA, transparência e saída fácil); consentimento para marketing contínuo (capturado na régua).
- Enriquecimento externo não é vedado, mas exige finalidade e rastreabilidade da origem → guardamos provedor/ID/data e minimizamos campos.
- **Validar com advogado de proteção de dados antes do piloto.**

### 9.2 WhatsApp
- Opt-in obrigatório antes de mensagens iniciadas pela empresa; pode ser obtido fora do WhatsApp; precisa de saída clara.
- Cobrança por mensagem desde 01/07/2025. Brasil (vigente desde 01/07/2026 — verificar antes de precificar): marketing ≈ R$ 0,3217; utility ≈ R$ 0,035; respostas dentro de 24h gratuitas.
- Z-API (não oficial) só para testes internos.

### 9.3 Marketplaces
- **Mercado Livre:** dados do comprador são compartilhados para fins da transação; envio indiscriminado de mensagens não é aceito.
- **Shopee:** levar o comprador para fora gera pontos de penalidade.
- **No produto:** CTA padrão para a loja no marketplace; primeira mensagem = pós-venda real; termo de responsabilidade no onboarding; nunca usar o chat do marketplace.

---

## 10. System design
*Método: `/engineering:system-design` — requisitos, desenho de alto nível, aprofundamento, escala e confiabilidade, trade-offs.*

### 10.1 Requisitos
**Funcionais:** seção 8.

**Não funcionais**
| Atributo | Requisito |
|---|---|
| Latência de webhook | resposta 2xx em < 2s (Bling exige < 5s e desliga o webhook após 3 dias de falhas) |
| Frescor | pedido novo visível em < 2 min; enriquecimento em < 5 min |
| Disponibilidade | 99,5% para webhooks (perder evento = cliente perdido); reconciliação diária cobre falhas |
| Consistência | eventual entre ingestão, métricas e réguas; **forte** para créditos e consentimento |
| Idempotência | todo worker pode reprocessar a mesma mensagem sem efeito duplicado |
| Custo | caber no Supabase Pro + Vercel Pro até ~300 sellers |
| Privacidade | RLS, criptografia de tokens, CPF fora de logs |

**Restrições:** 1 desenvolvedor + Claude Code; stack fixa (Next.js, Supabase, Vercel, GitHub); prazo de MVP curto.

### 10.2 Estimativa de carga
| Cenário | Premissa | Volume |
|---|---|---|
| Piloto | 5 sellers × 2.000 pedidos/mês | 10 mil pedidos/mês (~330/dia) |
| 12 meses | 300 sellers × 3.000 pedidos/mês | 900 mil pedidos/mês (~30 mil/dia, ~0,35/s médio) |
| Pico (Black Friday) | 10× a média por algumas horas | ~3,5 pedidos/s em webhooks |
| Chamadas ao Bling | ~1,3 por pedido (pedido + contato com cache) | ~1,2 mi/mês; por seller grande no pico, a fila absorve rajadas acima de 3 req/s |
| Mensagens | ~3 por cliente novo (teto: cada pedido = cliente novo) | até ~2,7 mi/mês (~1/s médio) |
| Armazenamento | ~1,5 KB/pedido normalizado + itens; JSON bruto só por 30 dias | ~1,5–2 GB/ano |

### 10.3 Componentes
```
┌────────────── Vercel (Next.js) ──────────────┐        ┌──────────── Supabase ─────────────┐
│ UI (Server Components + Server Actions)      │◀──────▶│ Postgres + RLS                    │
│ /api/webhooks/{bling,whatsapp}               │──────▶ │ pgmq: ingest, enrich, send,       │
│ /api/integrations/bling/{authorize,callback} │        │       backfill (+ dead letter)    │
│ /api/workers/{ingest,enrich,journeys,send,   │◀────── │ pg_cron + pg_net (a cada 1 min)   │
│               backfill,metrics,reconcile}    │        │ Auth                              │
│ /r/[code]  /p/[slug]  /c/[slug] (P1)         │        └───────────────────────────────────┘
└──────────┬──────────────┬──────────────┬─────┘
           ▼              ▼              ▼
     Bling API v3   Direct Data API   Meta WhatsApp Cloud API
```

### 10.4 Importação de histórico (onde o limite do Bling morde)
- Seller com 3 mil pedidos/mês = 36 mil pedidos/ano. Buscando cada pedido individualmente a ~2,8 req/s → **~3,6 h**, sem contar contatos.
- **Desenho:**
  1. Listar contatos paginados (100 por página) primeiro → cache local de CPF/nome/telefone. Poucas centenas de chamadas.
  2. Listar pedidos paginados do mais recente para o mais antigo (janelas de 30, 90 e 365 dias) → cria pedidos com totais e cliente já identificado.
  3. Detalhe de itens (necessário para ciclo por SKU) só para os últimos 90 dias na primeira passada; o restante em segundo plano em horários de baixa.
  4. UI mostra progresso por etapa e libera o produto assim que a etapa 1 + 30 dias terminam.
- **Confirmar na referência da API** quais campos a listagem de pedidos já devolve; se trouxer itens, a etapa 3 some.

### 10.5 Contratos de API (rotas internas)
| Rota | Método | Auth | Entrada | Saída |
|---|---|---|---|---|
| `/api/webhooks/bling` | POST | HMAC `X-Bling-Signature-256` | `{eventId,date,version,event,companyId,data}` | `200 {ok:true}` · `401` assinatura inválida |
| `/api/webhooks/whatsapp` | GET | `hub.verify_token` | query de verificação | `hub.challenge` |
| `/api/webhooks/whatsapp` | POST | `X-Hub-Signature-256` | payload Meta (statuses, messages) | `200` |
| `/api/integrations/bling/authorize` | GET | sessão (owner/admin) | `?org=` | redirect para Bling |
| `/api/integrations/bling/callback` | GET | `state` | `code,state` | redirect para `/[org]/settings/integrations` |
| `/api/workers/*` | POST | `Bearer CRON_SECRET` | `{batch?:number}` | `{processed,failed,remaining}` |
| `/r/[code]` | GET | pública, rate limit | — | 302 para destino |
| `/p/[slug]` | GET/POST | pública, rate limit | telefone/e-mail para saída | página de confirmação |

Mutações da UI usam **Server Actions** com validação Zod e checagem de papel.

### 10.6 Filas e processamento
- **pgmq** com visibility timeout de 60s. Worker lê até 50 mensagens, processa com concorrência 5, deleta as concluídas.
- **Retentativas:** a mensagem reaparece após o timeout; `read_ct > 5` → `pgmq.archive` + `job_failures` + alerta no admin.
- **Agendamento:** `pg_cron` a cada minuto chama cada worker via `pg_net` (`net.http_post` com `CRON_SECRET`). Worker que termina com fila cheia se re-dispara uma vez (encadeamento limitado).
- **Locks:** `pg_try_advisory_lock(hash(org_id))` garante 1 worker de Bling por seller; refresh de token sob lock próprio.
- **Réguas:** `journey_enrollments where next_run_at <= now() and status='active' for update skip locked limit 100`.
- **Envio:** fila `send` separada para respeitar janela de horário e limite de frequência na hora do envio (não na hora do agendamento).

### 10.7 Cache
| O quê | Onde | TTL |
|---|---|---|
| Resultado de enriquecimento por CPF | `enrichment_requests` (por seller) | 180 dias |
| Contato do Bling | tabela `bling_contacts_cache` | 24 h |
| Access token Bling | `integrations` (criptografado) | até `expires_at − 5 min` |
| Contagem de segmento | `segments.cached_count` | 10 min |
| Métricas do dashboard | view materializada por org | 15 min |

### 10.8 Falhas e recuperação
| Falha | Detecção | Resposta |
|---|---|---|
| Webhook do Bling perdido ou desligado | job `reconcile` diário compara pedidos alterados no período via polling | reprocessa diferenças; alerta se o webhook estiver desligado |
| 429 do Bling | status HTTP | backoff exponencial com jitter; pausa o seller por 60s |
| Bloqueio de IP do Bling | 403/erros em sequência | circuit breaker global de 10 min; alerta |
| Token revogado | 401 no refresh | `needs_reauth`, banner e e-mail para o owner |
| Direct Data fora | timeout/5xx | mensagem volta à fila; **não** debita crédito (débito só após sucesso, na mesma transação) |
| Meta rejeita template / número com qualidade baixa | webhook de status / qualidade | pausa réguas de marketing do seller e avisa |
| Saldo zero | função `debit_credits` | pausa enriquecimento, aviso na UI |

### 10.9 Observabilidade
- Logs estruturados JSON (`org_id`, `job`, `duration_ms`, `outcome`), sem CPF/telefone.
- Painel admin: profundidade e idade da fila mais antiga (`pgmq.metrics`), falhas por worker, integrações `needs_reauth`, consumo de créditos.
- Alertas: fila com mensagem > 10 min, > 20 falhas/hora, assinatura inválida em rajada, webhook do Bling sem eventos há 24h para seller ativo.

### 10.10 O que revisitar ao crescer
- **> 300 sellers ou > 5 req/s sustentado:** mover workers para serviço dedicado (Railway/Fly) ou orquestrador durável (Inngest) — ver ADR-002.
- **Volume de mensagens alto:** fila por número de WhatsApp com throughput próprio.
- **Métricas:** recalcular RFM incrementalmente em vez de job noturno completo.
- **Bling multi-empresa e outros ERPs:** camada `connectors/` com contrato comum.

---

## 11. Decisões de arquitetura (ADRs)
*Método: `/engineering:architecture`. Gravar cada ADR também em `docs/adr/NNN-titulo.md` no repo.*

### ADR-001: Monólito Next.js na Vercel com workers HTTP
**Status:** Aceito · **Data:** 08/10/2026 · **Decisor:** Diego

**Contexto:** um desenvolvedor com Claude Code, stack fixa, MVP rápido; precisa de UI, webhooks e processamento assíncrono.

**Decisão:** um único app Next.js. Webhooks e workers são Route Handlers; processamento assíncrono acionado por pg_cron.

| Opção | Complexidade | Custo | Escala | Familiaridade |
|---|---|---|---|---|
| **A. Monólito Next.js (escolhida)** | Baixa | Baixo | Média | Alta |
| B. Next.js + Supabase Edge Functions para workers | Média (Deno, 2 runtimes) | Baixo | Média | Média |
| C. Next.js + serviço Node separado (Railway) | Alta | Médio | Alta | Média |

**Trade-off:** A tem limite de tempo por execução e cold starts; compensado com lotes pequenos e idempotência.
**Consequências:** + um deploy, um repo, tipos compartilhados. − workers longos ficam fatiados. Revisitar quando o processamento por minuto passar de ~45s.

### ADR-002: Filas com Supabase Queues (pgmq) + pg_cron
**Status:** Aceito

**Contexto:** webhooks precisam de resposta rápida; trabalho pesado vai para fila; réguas precisam de "esperar N dias".

| Opção | Complexidade | Custo | Escala | Familiaridade |
|---|---|---|---|---|
| **A. pgmq + pg_cron + pg_net (escolhida)** | Média | Zero extra | Média | Média |
| B. Inngest (workflows duráveis, `step.sleep`) | Baixa no código | Plano grátis, depois pago | Alta | Baixa |
| C. Upstash QStash | Baixa | Por mensagem | Alta | Baixa |
| D. Só Vercel Cron | Baixa | Zero | Baixa (frequência limitada) | Alta |

**Trade-off:** A mantém fila e dados na mesma transação (enfileirar junto com o upsert) e não adiciona fornecedor; B é a melhor experiência para réguas complexas.
**Consequências:** + tudo no Postgres, auditável por SQL. − escrevemos o motor de régua na mão. **Revisitar com Inngest** se o motor de régua passar de ~5 tipos de passo ou se os workers ficarem frágeis.

### ADR-003: Multi-tenant em schema compartilhado com RLS
**Status:** Aceito

| Opção | Complexidade | Custo | Escala | Isolamento |
|---|---|---|---|---|
| **A. Schema único + `org_id` + RLS (escolhida)** | Baixa | Baixo | Alta | Bom (política no banco) |
| B. Schema por seller | Alta (migrations N vezes) | Médio | Média | Muito bom |
| C. Banco por seller | Muito alta | Alto | Alta | Máximo |

**Consequências:** + simples de evoluir. − um erro de política vaza dados → teste automatizado de RLS obrigatório em toda migration.

### ADR-004: Identidade do cliente por CPF dentro de cada seller (sem identidade global)
**Status:** Aceito

**Contexto:** o mesmo CPF pode ser cliente de vários sellers da plataforma.

| Opção | Prós | Contras |
|---|---|---|
| **A. Chave `(org_id, cpf)` (escolhida)** | Cada seller é controlador distinto; alinhado à LGPD | Enriquece o mesmo CPF mais de uma vez na plataforma |
| B. Pessoa global + vínculo por seller | Economiza consultas; visão de rede | Cruzamento de bases entre controladores sem base legal clara |

**Consequências:** custo de dados um pouco maior; risco jurídico muito menor. Reavaliar só com parecer jurídico (pergunta 4).

### ADR-005: Enriquecimento com Direct Data atrás de adapter
**Status:** Aceito

| Opção | Contratação | Custo | Retorno útil |
|---|---|---|---|
| **A. Direct Data (escolhida)** | Autosserviço, pré-pago, sem contrato | R$ 0,16/consulta (Cadastro PF Básica) | Telefones com flag WhatsApp, tipo, operadora, bloqueio de telemarketing |
| B. Bureaus com contrato (BigDataCorp, Assertiva, Neoway) | Comercial + contrato | Negociado | Geralmente mais profundo |
| C. APIs que só verificam se um número tem WhatsApp | Autosserviço | Baixo | Não descobrem o número a partir do CPF |

**Consequências:** + começa hoje, sem time comercial. − dependência de um fornecedor → interface `EnrichmentProvider` e campo `provider` em toda consulta para trocar ou combinar depois.

### ADR-006: WhatsApp pela Cloud API oficial da Meta
**Status:** Aceito

| Opção | Risco de banimento | Custo | Esforço |
|---|---|---|---|
| **A. Meta Cloud API, número do próprio seller (escolhida)** | Baixo (respeitando opt-in) | Tabela Meta por mensagem | Médio (seller cria WABA; MVP com conexão manual) |
| B. BSP (provedor oficial intermediário) | Baixo | Tabela Meta + taxa | Baixo para o seller |
| C. Z-API / WhatsApp Web não oficial | Alto | Mensalidade fixa | Baixo |

**Consequências:** onboarding de WhatsApp é a etapa mais difícil para o seller no MVP → tutorial forte (seção 14) e Embedded Signup em P2. Z-API só atrás de feature flag para testes.

### ADR-007: Atribuição por CPF, último toque, com holdout
**Status:** Aceito (holdout em P1)

| Opção | Funciona em pedido de marketplace? | Confiabilidade |
|---|---|---|
| **A. Novo pedido do mesmo CPF em janela após clique/leitura (escolhida)** | Sim (CPF vem na NF) | Boa; superestima sem holdout |
| B. Cupom único por cliente | Não (cupom não chega pelo marketplace ao ERP de forma confiável) | Alta onde funciona |
| C. Só UTM | Não | Baixa |

**Consequências:** o dashboard mostra "receita influenciada" até o holdout existir; com holdout, mostra "lift". Base para cobrança por sucesso no futuro.

### ADR-008: Criptografia de credenciais na aplicação (AES-256-GCM)
**Status:** Aceito

| Opção | Prós | Contras |
|---|---|---|
| **A. AES-GCM no app com `ENCRYPTION_KEY` na Vercel (escolhida)** | Simples, testável, independente do banco | Rotação de chave manual |
| B. Supabase Vault | Gerenciado no banco | Acesso via SQL com service role; mais acoplado |

**Consequências:** função `rotateKey` documentada; chave nunca no repo.

---

## 12. Modelo de dados

Todas as tabelas de negócio: `org_id uuid not null`, `created_at`, `updated_at`, RLS com `is_org_member(org_id)`. Dinheiro em `numeric(12,2)`; IDs do Bling em `bigint`; datas em UTC.

```sql
-- Tenancy
organizations(id, name, slug unique, timezone default 'America/Sao_Paulo', settings jsonb)
memberships(org_id, user_id, role check in ('owner','admin','member'), primary key(org_id,user_id))
platform_admins(user_id primary key)

-- Integrações
integrations(id, org_id, provider check in ('bling','meta_cloud','zapi'),
  status check in ('active','needs_reauth','disabled','error'),
  external_account_id text, credentials_encrypted text, token_expires_at,
  config jsonb, last_error text, unique(provider, external_account_id))
oauth_states(state primary key, org_id, user_id, expires_at)
webhook_events(id, org_id null, source, event_id unique, event_type, payload jsonb,
  signature_valid bool, received_at, processed_at, error)   -- payload apagado após 30 dias
sync_jobs(id, org_id, kind check in ('backfill','reconcile'), stage, cursor jsonb,
  status, progress jsonb, started_at, finished_at)
bling_contacts_cache(org_id, bling_contact_id bigint, data jsonb, fetched_at,
  primary key(org_id, bling_contact_id))

-- Comércio
sales_channels(id, org_id, bling_store_id bigint, name, kind, unique(org_id, bling_store_id))
customers(id, org_id, cpf char(11), first_name, full_name, email, city, uf,
  identity_key text not null, identity_confidence check in ('high','low'), tags text[],
  unique(org_id, identity_key))
orders(id, org_id, customer_id, channel_id, bling_order_id bigint, number, store_order_number,
  status, total, ordered_at, invoiced_at, unique(org_id, bling_order_id))
order_items(id, org_id, order_id, sku, product_name, bling_product_id, quantity, unit_price, total)
customer_metrics(customer_id primary key, org_id, orders_count, total_spent, avg_ticket,
  first_order_at, last_order_at, recency_days, avg_days_between_orders,
  rfm_r, rfm_f, rfm_m, rfm_segment, predicted_next_purchase_at, updated_at)
product_cycles(org_id, sku, median_days, sample_size, primary key(org_id, sku))

-- Contato, enriquecimento, consentimento
contact_points(id, org_id, customer_id, kind check in ('whatsapp','phone','email'), value,
  is_primary, source check in ('erp','enrichment','manual','inbound','capture_page'),
  whatsapp_flag bool, confidence check in ('high','low'), verified_at,
  unique(org_id, kind, value))
enrichment_requests(id, org_id, customer_id, cpf_hash, provider,
  status check in ('queued','skipped','success','not_found','no_whatsapp','error','low_confidence'),
  skip_reason, provider_query_id, cost, price, response_minimized jsonb, created_at)
consents(id, org_id, customer_id, channel, purpose check in ('transactional','marketing'),
  status check in ('unknown','transactional_only','opted_in','opted_out'),
  legal_basis check in ('legitimate_interest','consent','contract'), evidence jsonb, updated_at,
  unique(org_id, customer_id, channel, purpose))
suppressions(org_id, value_hash, reason, created_at, primary key(org_id, value_hash))

-- Créditos
credit_wallets(org_id primary key, unit_price numeric default 0.30)
credit_transactions(id, org_id, amount, kind check in ('topup','enrichment','adjustment','refund'),
  reference_id, note, created_by, created_at)          -- append-only
-- view credit_balances; função debit_credits(org, amount, ref) atômica

-- Mensageria
message_templates(id, org_id, provider_template_id, name, language, category, status, components jsonb, synced_at)
messages(id, org_id, customer_id, contact_point_id, direction check in ('outbound','inbound'),
  template_id, journey_id, campaign_id, body jsonb, provider_message_id unique,
  status check in ('queued','sent','delivered','read','failed','received'),
  error, cost_estimate, sent_at, created_at)
tracked_links(code primary key, org_id, message_id, customer_id, destination_url, created_at)
link_clicks(id, org_id, code, clicked_at, user_agent)

-- Réguas, segmentos, campanhas
segments(id, org_id, name, rules jsonb, cached_count, cached_at)
journeys(id, org_id, name, status check in ('draft','active','paused'), trigger_type, trigger_config jsonb,
  exit_on_purchase bool default true, holdout_pct int default 0, created_by)
journey_steps(id, journey_id, position, type check in ('wait','condition','send_template','add_tag','exit'), config jsonb)
journey_enrollments(id, org_id, journey_id, customer_id, current_position,
  status check in ('active','completed','exited','holdout'), next_run_at, entered_at, exited_reason)
campaigns(id, org_id, name, segment_id, template_id, status, scheduled_at, sent_count, cost_estimate, created_by)

-- Atribuição e auditoria
conversions(id, org_id, order_id unique, customer_id, message_id, journey_id, campaign_id,
  attribution_type check in ('click','view'), revenue, attributed_at)
audit_log(id, org_id, actor_id, action, entity, entity_id, metadata jsonb, created_at)
job_failures(id, queue, payload jsonb, error, attempts, created_at)
```

**Índices:** `orders(org_id, customer_id, ordered_at desc)`, `customers(org_id, cpf)`, `journey_enrollments(next_run_at) where status='active'`, `messages(org_id, customer_id, sent_at desc)`, `link_clicks(org_id, code)`.
**Filas pgmq:** `ingest`, `enrich`, `send`, `backfill`.

---

## 13. Integrações externas

### 13.1 Bling API v3
- Base `https://api.bling.com.br/Api/v3`, OAuth 2.0 authorization code + refresh. **Confirmar URLs, campos e escopos na referência oficial antes de codar.**
- Escopos mínimos: pedidos de venda, contatos, notas fiscais (NF-e e NFC-e), produtos (leitura), dados da empresa, lojas.
- Webhooks configurados na aba Webhooks do app; recursos `order`, `invoice`, `consumer_invoice`; ações `created`, `updated`, `deleted`; envelope `eventId`, `date`, `version`, `event`, `companyId`, `data`; entregas sem ordem garantida; retentativas por até 3 dias.
- Limites: 3 req/s e 120 mil/dia por conta; bloqueio de IP com 300 erros ou 600 requisições em 10s, ou 20 chamadas a `/oauth/token` em 60s; filtros de período ≤ 1 ano.
- **Um único app Bling (da Vivaz) atende todos os sellers**; `companyId` roteia ao seller.

### 13.2 Direct Data
- `GET apiv3.directd.com.br/api/CadastroPessoaFisica` com CPF + token; R$ 0,16; síncrono (assíncrono com webhook opcional, sem custo extra). Confirmar nomes dos parâmetros na documentação técnica.
- Cada consulta é cobrada, mesmo repetida; sem limite declarado de requisições por minuto.
- Antes do piloto: pedir documentação de LGPD/origem dos telefones.

```ts
interface EnrichmentProvider {
  name: 'directdata' | 'mock';
  enrichByCpf(input: { cpf: string; name?: string }): Promise<{
    status: 'success' | 'not_found' | 'error';
    queryId?: string; cost: number;
    phones: { e164: string; type: 'mobile' | 'landline'; whatsapp: boolean; dncBlocked: boolean }[];
    emails: string[]; returnedName?: string; city?: string; uf?: string;
  }>;
}
```

### 13.3 Meta WhatsApp Cloud API
- Envio: `POST https://graph.facebook.com/{versão}/{phone_number_id}/messages`.
- Webhook com verificação `hub.challenge` e assinatura `X-Hub-Signature-256`.
- Templates criados no WhatsApp Manager no MVP (textos na seção 14.7).

```ts
interface MessagingProvider {
  name: 'meta_cloud' | 'zapi' | 'mock';
  sendTemplate(a: { to: string; template: string; lang: string; variables: Record<string,string> }): Promise<{ providerMessageId: string }>;
  sendText(a: { to: string; text: string }): Promise<{ providerMessageId: string }>;
  listTemplates(): Promise<TemplateDTO[]>;
}
```

---

## 14. UX e copy
*Método: `/design:ux-copy` — claro, conciso, consistente, útil, humano. Para o Claude Code: use estes textos como estão; centralize em `lib/copy/pt-BR.ts`.*

### 14.1 Voz e tom
- **Quem fala:** um lojista experiente falando com outro lojista. Direto, prático, sem jargão de marketing.
- **Sempre:** "você"; frases curtas; verbo no começo dos botões; números concretos ("312 clientes", "R$ 48,20").
- **Nunca:** "lead", "conversão atribuída", "opt-in", "enriquecimento" na interface do seller (ficam só no código); exclamação em mensagens de erro; promessas de resultado garantido.
- **Tom por situação:** sucesso = comemora na medida; erro = empatia + saída; aviso = claro e acionável; neutro = informa e sai da frente.

### 14.2 Glossário (mesma palavra para a mesma coisa, em todo lugar)
| Termo interno | Termo na interface |
|---|---|
| customer | **Cliente** |
| order | **Pedido** |
| sales channel | **Canal** (ex.: Mercado Livre) |
| enrichment | **Busca de WhatsApp** |
| credits | **Créditos** |
| journey | **Régua** |
| campaign | **Envio em massa** |
| segment | **Lista de clientes** |
| conversion | **Comprou de novo** |
| attributed revenue | **Vendas geradas pelo CRM** |
| holdout | **Grupo de comparação** |
| consent `opted_in` | **Aceitou novidades** |
| consent `transactional_only` | **Só avisos do pedido** |
| consent `opted_out` | **Não quer mensagens** |
| consent `unknown` | **Ainda não contatado** |
| low_confidence | **Número a confirmar** |

### 14.3 Onboarding
**Passo 1 — Boas-vindas**
- Título: **Vamos transformar seus pedidos em clientes que voltam**
- Texto: Em poucos minutos você conecta seu Bling e vê todos os seus clientes de marketplace num lugar só.
- Botão: **Começar**

**Passo 2 — Conectar Bling**
- Título: **Conecte seu Bling**
- Texto: Vamos ler seus pedidos e notas fiscais para montar sua lista de clientes. Não alteramos nada no seu Bling.
- Botão: **Conectar Bling**
- Caixa de aceite (obrigatória): ☐ *Sou responsável pelos dados dos meus clientes e conheço as regras dos marketplaces em que vendo. Li os [Termos de uso] e a [Política de privacidade].*

**Passo 3 — Importando**
- Título: **Trazendo seus clientes**
- Estados (loading):
  - "Lendo seus contatos do Bling…"
  - "Importando pedidos dos últimos 30 dias… {n} de {total}"
  - "Pronto para começar. O restante do histórico continua carregando em segundo plano."
- Botão (aparece ao fim dos 30 dias): **Ver meus clientes**

**Passo 4 — Canais**
- Título: **De onde vêm seus pedidos?**
- Texto: Dê um nome para cada loja do Bling. Isso ajuda a separar clientes por marketplace.
- Placeholder: "Ex.: Mercado Livre"
- Botão: **Salvar canais**

**Passo 5 — WhatsApp**
- Título: **Conecte o WhatsApp da sua loja**
- Texto: Usamos a API oficial do WhatsApp. Seu número fica protegido contra bloqueios e as mensagens saem com o nome da sua loja.
- Botão: **Conectar WhatsApp** · link secundário: **Fazer isso depois**
- Ajuda: "Precisa de ajuda? Veja o passo a passo (5 min)"

**Passo 6 — Primeira régua**
- Título: **Ligue sua primeira régua**
- Texto: A régua de pós-venda avisa o cliente sobre o pedido e pergunta se ele quer receber novidades. É o jeito seguro de começar.
- Botão: **Ligar régua de pós-venda**

### 14.4 Botões (CTAs) principais
| Contexto | Texto |
|---|---|
| Buscar WhatsApp de um cliente | **Buscar WhatsApp** |
| Nova lista | **Criar lista de clientes** |
| Novo envio | **Criar envio em massa** |
| Confirmar envio | **Enviar para {n} clientes** |
| Ativar régua | **Ligar régua** / **Pausar régua** |
| Recarga | **Adicionar créditos** |
| Reconexão | **Reconectar Bling** |
| Exportar dados (LGPD) | **Baixar dados do cliente** |
| Excluir dados (LGPD) | **Apagar dados do cliente** |

### 14.5 Estados vazios
| Tela | Texto | Botão |
|---|---|---|
| Clientes | **Nenhum cliente ainda.** Assim que seu Bling estiver conectado, seus clientes aparecem aqui. | **Conectar Bling** |
| Réguas | **Nenhuma régua ligada.** Réguas mandam a mensagem certa na hora certa, sozinhas. Comece pela de pós-venda. | **Ver réguas prontas** |
| Envios em massa | **Nenhum envio ainda.** Escolha uma lista de clientes e mande uma mensagem para todos de uma vez. | **Criar envio em massa** |
| Listas | **Nenhuma lista criada.** Agrupe clientes por canal, produto ou última compra. | **Criar lista de clientes** |
| Dashboard (sem WhatsApp) | **Seus clientes já estão aqui.** Conecte o WhatsApp para começar a vender de novo para eles. | **Conectar WhatsApp** |
| Vendas geradas | **Nenhuma venda gerada ainda.** Quando um cliente comprar depois de uma mensagem, ela aparece aqui. | — |
| Busca sem resultado | **Nenhum cliente encontrado para "{termo}".** Tente nome, CPF ou número do pedido. | — |

### 14.6 Erros e avisos (o que aconteceu + por quê + como resolver)
| Situação | Texto | Ação |
|---|---|---|
| Bling desconectado | **Seu Bling foi desconectado.** A autorização expirou ou foi removida. Novos pedidos ficam guardados e entram assim que você reconectar. | **Reconectar Bling** |
| Sem créditos | **Seus créditos acabaram.** A busca de WhatsApp está pausada para novos clientes. Os clientes chegam normalmente. | **Adicionar créditos** |
| Créditos baixos | **Restam {n} créditos** — dá para cerca de {dias} dias no seu ritmo atual. | **Adicionar créditos** |
| WhatsApp com token inválido | **Não conseguimos enviar pelo seu WhatsApp.** O acesso à conta mudou. Atualize o token para voltar a enviar. | **Atualizar conexão** |
| Qualidade do número caiu | **A qualidade do seu número caiu no WhatsApp.** Muitas pessoas bloquearam ou denunciaram mensagens. Pausamos os envios de novidades por segurança. | **Ver o que fazer** |
| Template rejeitado | **O WhatsApp recusou a mensagem "{nome}".** Motivo informado: {motivo}. Ajuste o texto no WhatsApp Manager e sincronize de novo. | **Sincronizar mensagens** |
| CPF inválido | **CPF inválido na nota do pedido #{n}.** Não dá para buscar o WhatsApp deste cliente. | — |
| Número a confirmar | **Número a confirmar.** O nome encontrado não bate com o da nota. Este cliente não entra em réguas automáticas. | **Usar mesmo assim** / **Ignorar número** |
| Fora do horário | **Envio agendado para {data, 9h}.** Mensagens só saem entre 9h e 20h para não incomodar seus clientes. | — |
| Falha genérica | **Algo deu errado do nosso lado.** Já fomos avisados. Tente de novo em alguns minutos. | **Tentar de novo** |

### 14.7 Diálogos de confirmação
**Envio em massa**
- Título: **Enviar "{template}" para {n} clientes?**
- Texto: Custo estimado no WhatsApp: **R$ {valor}**. {x} clientes ficam de fora porque não aceitaram novidades ou estão fora do limite de frequência.
- Botões: **Enviar para {n} clientes** · **Voltar e revisar**

**Ligar régua**
- Título: **Ligar "{régua}"?**
- Texto: {n} clientes entram agora. Novos clientes entram sozinhos quando {gatilho}.
- Botões: **Ligar régua** · **Deixar desligada**

**Buscar WhatsApp manualmente**
- Título: **Buscar WhatsApp de {nome}?**
- Texto: Usa 1 crédito. Você tem {saldo}.
- Botões: **Buscar WhatsApp** · **Cancelar busca**

**Apagar dados do cliente (LGPD)**
- Título: **Apagar todos os dados de {nome}?**
- Texto: Pedidos, contatos e histórico de mensagens deste cliente serão apagados do CRM. Isso não pode ser desfeito e não altera nada no seu Bling.
- Botões: **Apagar dados** · **Manter dados**

### 14.8 Tooltips
| Elemento | Texto |
|---|---|
| Vendas geradas pelo CRM | Pedidos de clientes que compraram até 7 dias depois de clicar numa mensagem, ou até 3 dias depois de ler. |
| Grupo de comparação | Uma parte dos clientes não recebe a régua. Comparar os dois grupos mostra quanto a régua realmente vendeu a mais. |
| Segmento RFM | Classifica o cliente pela última compra, quantas vezes comprou e quanto gastou. |
| Próxima compra prevista | Calculada pelo tempo médio que seus clientes levam para comprar este produto de novo. |
| Custo estimado | Valor cobrado pelo WhatsApp por mensagem. Novidades custam mais que avisos de pedido. |

### 14.9 Sucesso (toasts)
- "Bling conectado. Seus clientes estão chegando."
- "Régua ligada. {n} clientes entraram."
- "Envio programado para {n} clientes."
- "{n} créditos adicionados."
- "Primeira venda gerada pelo CRM: R$ {valor} 🎉" *(único emoji permitido na interface)*

### 14.10 Mensagens de WhatsApp (templates)
Restrições: corpo do template ≤ 1.024 caracteres; texto de botão ≤ 20 caracteres; variáveis com fallback; primeiro nome em formato título; nome da loja sempre na primeira linha. Templates são enviados para aprovação da Meta; a categoria final é decidida por ela.

**A. `pedido_faturado_optin` — UTILITY (primeira mensagem)**

**Recomendado:**
> Oi, {{1}}! Aqui é da {{2}}.
> Seu pedido {{3}} foi faturado e já está seguindo para entrega.
> Se tiver qualquer problema com a entrega, é só responder esta mensagem.
> Você também quer receber dicas e ofertas da {{2}} por aqui?

Botões: **[Quero receber]** **[Não, obrigado]**
Variáveis: {{1}} primeiro nome (fallback "tudo bem?" → "Oi, tudo bem?"), {{2}} nome da loja, {{3}} produto principal ou "#número".

| Opção | Texto de abertura | Tom | Melhor para |
|---|---|---|---|
| A (recomendada) | "Seu pedido {{3}} foi faturado e já está seguindo para entrega." | Neutro, útil | Todo seller |
| B | "Passando para avisar que o {{3}} já saiu daqui." | Próximo | Marcas pessoais (artesanato, moda) |
| C | "Confirmamos o faturamento do seu pedido {{3}}." | Formal | Eletrônicos, ticket alto |

*Racional:* abre com o motivo legítimo do contato (o pedido), oferece ajuda real e só no fim pede permissão — com saída explícita.

**B. Resposta ao "Quero receber"** (dentro da janela de 24h, sem custo)
> Combinado, {{1}}! Vamos mandar só o que vale a pena. Se quiser parar, é só enviar SAIR.

**C. Resposta ao "Não, obrigado" ou SAIR**
> Tudo certo, {{1}}. Você não vai receber novidades da {{2}}. Avisos sobre seus pedidos continuam chegando normalmente.

**D. `hora_de_repor` — MARKETING (só com opt-in)**
> Oi, {{1}}! O {{2}} que você comprou costuma durar cerca de {{3}} dias. Já está na hora de repor?
> Ele está aqui na nossa loja: {{4}}
> Para não receber mais, responda SAIR.

Botão: **[Ver produto]**

**E. `sentimos_sua_falta` — MARKETING (só com opt-in)**
> Oi, {{1}}! Faz um tempo que você não passa na {{2}}. Separamos novidades que combinam com o que você já levou: {{3}}
> Para não receber mais, responda SAIR.

**F. `chegou_bem` — UTILITY (P1, pós-entrega)**
> Oi, {{1}}! Seu pedido {{2}} já deve ter chegado. Está tudo certo com ele?

Botões: **[Tudo certo]** **[Tive um problema]**

### 14.11 Página pública de privacidade e saída (`/p/{slug}`)
- Título: **Suas mensagens da {loja}**
- Texto: A {loja} usa seus dados de compra para avisar sobre seus pedidos e, se você aceitar, enviar novidades pelo WhatsApp. Você pode parar quando quiser.
- Campo: "Seu WhatsApp com DDD"
- Botão: **Parar de receber mensagens**
- Confirmação: **Pronto. Você não vai mais receber novidades da {loja}.** Pode levar alguns minutos para valer em todos os envios.
- Rodapé: "Quer saber quais dados a {loja} tem sobre você? Fale com {e-mail de contato do seller}."

### 14.12 Notas de localização
- Somente pt-BR no MVP. Datas `dd/mm/aaaa`, moeda `R$ 1.234,56`, telefone `(11) 98765-4321`.
- Evitar gírias regionais e "tu"; usar "você".
- Nomes vindos da NF em caixa alta: converter para formato título e usar só o primeiro nome.
- Preparar `lib/copy/` para espanhol (ML na América Latina) sem traduzir agora.

---

## 15. Segurança
- RLS em todas as tabelas de negócio; service role só no servidor.
- Tokens criptografados (ADR-008); nunca no client nem em log.
- Webhooks: assinatura obrigatória, corpo bruto, comparação em tempo constante.
- Workers: `Authorization: Bearer ${CRON_SECRET}`.
- CPF mascarado na UI (`***.456.789-**`); exibir completo só para owner/admin, com registro no `audit_log`.
- `cpf_hash` (SHA-256 + pepper) em logs e enriquecimento.
- Rate limit em `/r/*`, `/p/*`, `/c/*` e webhooks.
- `.env.example` sem valores; nada de segredo no repo.

### Variáveis de ambiente
```
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=https://egwxlwtfeswnmpsmphip.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ENCRYPTION_KEY=
CPF_HASH_PEPPER=
CRON_SECRET=
BLING_CLIENT_ID=
BLING_CLIENT_SECRET=
BLING_REDIRECT_URI=${NEXT_PUBLIC_APP_URL}/api/integrations/bling/callback
ENRICHMENT_PROVIDER=mock|directdata
DIRECTDATA_TOKEN=
MESSAGING_PROVIDER=mock|meta_cloud|zapi
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=
```

### Estrutura de pastas
```
/app
  /(marketing)/page.tsx
  /(auth)/login, /signup, /callback
  /(app)/[org]/{dashboard,customers,customers/[id],segments,campaigns,journeys,journeys/[id],inbox}
  /(app)/[org]/settings/{general,integrations,channels,enrichment,messaging,credits,team,privacy}
  /admin
  /p/[slug]   /c/[slug] (P1)   /r/[code]/route.ts
  /api/integrations/bling/{authorize,callback}/route.ts
  /api/webhooks/{bling,whatsapp}/route.ts
  /api/workers/{ingest,enrich,journeys,send,backfill,metrics,reconcile}/route.ts
/lib
  /supabase/{server,client,admin}.ts
  /copy/pt-BR.ts
  crypto.ts  cpf.ts  phone.ts  names.ts  queue.ts  attribution.ts
  /integrations/bling/{client,oauth,webhook,mappers,rate-limit}.ts
  /enrichment/{provider,directdata,mock,select-phone,name-match}.ts
  /messaging/{provider,meta-cloud,zapi,mock,templates}.ts
  /journeys/{engine,triggers,steps}.ts
  /segments/{schema,compile}.ts
  /metrics/rfm.ts
/supabase/migrations
/docs/{PRD.md,PROGRESS.md,ARCHITECTURE.md,adr/}
/tests
```

---

## 16. Plano de execução por fases
> Ao fim de cada fase: `lint` + `typecheck` + `test` + `build` → commit (Conventional Commits) → push. Atualizar `docs/PROGRESS.md`.

### Fase 0 — Fundação
- Auditar o repo existente; manter o que serve, registrar o que foi removido.
- Next.js 15 + TS strict + Tailwind + shadcn/ui + ESLint/Prettier + Vitest.
- Supabase SSR auth; migrations de tenancy, `is_org_member`, RLS + teste de RLS.
- Layout com sidebar e todas as seções com estados vazios da 14.5.
- `crypto.ts`, `cpf.ts`, `phone.ts`, `names.ts`, `copy/pt-BR.ts` com testes.
- `docs/adr/` com os 8 ADRs da seção 11.
- **Aceite:** deploy abre login; usuário cria org e vê o dashboard vazio; testes passam.

### Fase 1 — Bling
- Migrations de integrações, webhooks, comércio, pgmq, pg_cron.
- OAuth, webhook com HMAC e idempotência, workers `ingest`, `backfill` (progressivo, 10.4) e `reconcile`.
- Clientes 360, canais, métricas, RFM, ciclos por SKU.
- Onboarding passos 1–4 com a copy da 14.3.
- **Aceite:** conta Bling real conectada; primeiros clientes em < 15 min; pedido novo em < 2 min; mesmo CPF em 2 canais = 1 cliente.

### Fase 2 — Busca de WhatsApp, créditos e LGPD
- Provider `mock` + `directdata`; regras 7.1; cache; minimização; débito atômico.
- Telas de configuração, créditos, privacidade; `/p/[slug]`; exportar/apagar cliente; admin com recarga.
- **Aceite:** sem cobrança duplicada; saldo zero pausa; CNPJ nunca consultado; campos descartados não persistidos.

### Fase 3 — WhatsApp
- Provider `mock` + `meta_cloud` (+ `zapi` sob flag); conexão com tutorial; sync de templates; webhook; opt-in/opt-out; `/r/[code]`; envio manual pela ficha.
- **Em paralelo: teste concierge da seção 2.5.**
- **Aceite:** entrega real; status atualizado; "SAIR" bloqueia marketing em < 1 min.

### Fase 4 — Réguas, listas e envios em massa
- Motor de régua; 3 réguas prontas; listas (regra JSON → SQL parametrizado); envio em massa com diálogo de custo.
- **Aceite:** teste com relógio simulado; marketing nunca sai sem opt-in; horário e frequência respeitados.

### Fase 5 — Atribuição, dashboard e piloto
- Atribuição (ADR-007); dashboard; tooltips; admin de saúde; onboarding passos 5–6; polimento mobile.
- **Aceite:** conversão correta para CPF que clicou; números do dashboard batem com consulta SQL de conferência; seller piloto termina o onboarding sozinho.

### Fase 6 (P1)
- Grupo de comparação (holdout), QR code na embalagem (`/c/[slug]`), inbox, IA para texto de template, recarga PIX, e-mail, pesquisa pós-entrega.

---

## 17. Riscos e mitigação
| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Punição do seller no marketplace | Média | Alto | CTA padrão para a loja no marketplace; mensagem 1 útil; termo no onboarding; parecer jurídico |
| Questionamento LGPD sobre enriquecimento | Média | Alto | Seller controlador; LIA; minimização; rastreabilidade; saída em toda mensagem; QR na embalagem como canal alternativo |
| Queda de qualidade/bloqueio do número | Média | Alto | API oficial; opt-in primeiro; limite de frequência; pausa automática |
| Número de outra pessoa | Média | Médio | Conferência de nome; flag WhatsApp; "número a confirmar" fora das réguas |
| Bling desligar webhook | Baixa | Alto | Resposta rápida + fila; reconciliação diária; alerta |
| Bloqueio de IP no Bling | Baixa | Alto | Lock por seller, backoff, circuit breaker |
| Importação lenta frustra o onboarding | Alta | Médio | Importação progressiva e copy que define expectativa |
| Bling lança módulo nativo | Média | Alto | Parceria e app na loja do Bling; profundidade vertical; multi-ERP |
| Match baixo de WhatsApp | Média | Médio | Teste concierge cedo; segundo provedor pelo adapter |

---

## 18. Perguntas em aberto
| # | Pergunta | Quem | Bloqueia? |
|---|---|---|---|
| 1 | O desenho (CPF da NF + busca de WhatsApp + régua opt-in primeiro) é defensável na LGPD e nos termos de ML/Shopee/Amazon? | Jurídico | Sim, antes do piloto |
| 2 | Modelo de cobrança: assinatura + créditos, % das vendas geradas, ou híbrido? | Diego | Não |
| 3 | Preço de revenda do crédito (sugestão R$ 0,30) | Diego | Não |
| 4 | Cache de busca compartilhado entre sellers? (ADR-004 diz não) | Jurídico | Não |
| 5 | Quais situações de pedido no Bling significam "faturado" e "entregue" para cada seller? | Engenharia + piloto | Não |
| 6 | Taxa real de match e documentação LGPD da Direct Data | Diego / fornecedor | Não |
| 7 | Nome definitivo do produto e domínio | Diego | Não |
| 8 | A listagem de pedidos do Bling já traz itens? (muda o tempo de importação) | Engenharia | Não |

---

## 19. Fontes
- Bling — Webhooks: https://developer.bling.com.br/webhooks
- Bling — Limites: https://developer.bling.com.br/limites
- Bling — Documentação: https://developer.bling.com.br/
- Bling MCP oficial: https://claude.com/es/marketplace/connectors/bling-mcp
- Direct Data — Cadastro PF Básica: https://www.directd.com.br/apis/cadastro-pf-basica
- Direct Data — Preços: https://directd.com.br/precos
- Direct Data — FAQ: https://www.directd.com.br/central-de-ajuda/faq/
- Meta — Opt-in: https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in
- Meta — Preços: https://developers.facebook.com/docs/whatsapp/pricing
- WhatsApp Brasil 2026: https://chatmaxima.com/whatsapp-api-pricing/brazil/
- Mercado Livre — uso de dados entre usuários: https://www.mercadolibre.com.co/privacidad/declaracion-privacidad/31256
- Shopee — Off-Shopee Transactions: https://www.lmc.vn/blog/knowledge-22/off-shopee-transactions-what-you-need-to-know-and-how-to-avoid-violations-1401
- LGPD e enriquecimento: https://www.migalhas.com.br/depeso/349299/lgpd-nao-veda-o-enriquecimento-de-bases-de-dados-pessoais
- Legítimo interesse e marketing direto: https://confidata.com.br/blog/legitimo-interesse-lgpd-lia-exemplos-limites
- SocialHub: https://www.socialhub.pro/blog/perguntas-respostas-crm-whatsapp/
- Kommo + Bling: https://www.kommo.com/br/blog/bling/
- Reportana: https://apps.shopify.com/reportana
- RD Station + Pluga: https://www.rdstation.com/integracoes/bling-by-pluga/
- WaSeller (extensão): https://www.extscope.org/extension/illemhbijpiebjfilfmgebahaakajkpe
- Avaliação de usuário do Bling pedindo integração com CRM: https://www.b2bstack.com.br/product/bling-erp/avaliacoes?page=3
- Segunda Venda: https://lp.segundavenda.com.br/
