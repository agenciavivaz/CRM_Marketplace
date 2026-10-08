import { ptBR, type Copy } from './pt-BR';

/**
 * Ponto único de acesso à copy. Hoje só pt-BR; o espanhol (ML na América Latina) entra
 * adicionando `es.ts` com o mesmo formato (`satisfies Copy`) e escolhendo por org.
 */
export type Locale = 'pt-BR';

const dictionaries: Record<Locale, Copy> = { 'pt-BR': ptBR };

export function getCopy(locale: Locale = 'pt-BR'): Copy {
  return dictionaries[locale];
}

export const copy = ptBR;

/** Preenche `{chave}` com valores: fmt('Enviar para {n} clientes', { n: 312 }). */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{([^{}]+)\}/g, (match, key: string) => {
    const value = vars[key.trim()];
    return value === undefined ? match : String(value);
  });
}
