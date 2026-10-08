# CRMarketplace

O primeiro CRM para quem vende em marketplace: transforma cada nota fiscal do Bling em um cliente identificado por CPF, encontra o WhatsApp dele e roda réguas de pós-venda e recompra — medindo quanto de receita voltou.

- Produto: [docs/PRD.md](docs/PRD.md)
- Arquitetura: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · Decisões: [docs/adr](docs/adr/README.md)
- Progresso e pendências: [docs/PROGRESS.md](docs/PROGRESS.md)

```bash
pnpm install
cp .env.example .env.local
pnpm dev        # http://localhost:3000
pnpm check      # lint + typecheck + testes + RLS + build
```
