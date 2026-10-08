import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fmt } from '@/lib/copy';
import { ptBR } from '@/lib/copy/pt-BR';

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === 'object')
    Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|mdx?)$/.test(name) ? [p] : [];
  });
}

// Glossário 14.2 / voz 14.1: termos internos que nunca aparecem para o seller.
const FORBIDDEN = [
  /\blead(s)?\b/i,
  /opt-?in/i,
  /opt-?out/i,
  /enriquecimento/i,
  /convers(ão|ões) atribuída/i,
];

describe('copy pt-BR', () => {
  it('não usa termos proibidos do glossário', () => {
    for (const s of collectStrings(ptBR)) {
      for (const re of FORBIDDEN) expect(s, `"${s}"`).not.toMatch(re);
    }
  });

  it('textos JSX em app/ e components/ não usam termos proibidos', () => {
    const files = [...walk('app'), ...walk('components')];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      // só texto entre tags JSX (>texto<), não identificadores de código
      const texts = [...src.matchAll(/>([^<>{}]*[A-Za-zÀ-ú][^<>{}]*)</g)].map((m) => m[1]!);
      for (const t of texts)
        for (const re of FORBIDDEN) expect(t, `${file}: "${t}"`).not.toMatch(re);
    }
  });

  it('erros não têm exclamação', () => {
    for (const s of collectStrings(ptBR.errors)) expect(s).not.toContain('!');
  });

  it('textos de botão dos templates têm até 20 caracteres e corpo até 1024', () => {
    const t = ptBR.whatsappTemplates;
    for (const tpl of [t.pedido_faturado_optin, t.hora_de_repor, t.chegou_bem]) {
      expect(tpl.body.length).toBeLessThanOrEqual(1024);
      for (const b of tpl.buttons) expect(b.length).toBeLessThanOrEqual(20);
    }
  });

  it('o único emoji permitido é o da primeira venda', () => {
    const withEmoji = collectStrings(ptBR).filter((s) => /\p{Extended_Pictographic}/u.test(s));
    expect(withEmoji).toEqual([ptBR.toasts.firstConversion]);
  });

  it('fmt interpola variáveis', () => {
    expect(fmt(ptBR.cta.sendTo, { n: 312 })).toBe('Enviar para 312 clientes');
    expect(fmt(ptBR.empty.search.title, { termo: 'maria' })).toBe(
      'Nenhum cliente encontrado para "maria".',
    );
    expect(fmt('{a} {b}', { a: 1 })).toBe('1 {b}');
  });
});
