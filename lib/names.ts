/** Tratamento de nomes vindos da nota fiscal (seção 6 e 14.12). */

const LOWERCASE_PARTICLES = new Set([
  'da',
  'de',
  'do',
  'das',
  'dos',
  'e',
  'di',
  'du',
  'del',
  'van',
  'von',
]);

export function cleanSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** "MARIA DA SILVA SANTOS" → "Maria da Silva Santos" */
export function toTitleCase(value: string | null | undefined): string {
  const clean = cleanSpaces(value ?? '');
  if (!clean) return '';
  return clean
    .toLocaleLowerCase('pt-BR')
    .split(' ')
    .map((word, i) => {
      if (i > 0 && LOWERCASE_PARTICLES.has(word)) return word;
      return word
        .split(/([-'])/)
        .map((part) =>
          part.length > 0 && !/[-']/.test(part)
            ? part[0]!.toLocaleUpperCase('pt-BR') + part.slice(1)
            : part,
        )
        .join('');
    })
    .join(' ');
}

/** "MARIA SILVA SANTOS" → "Maria". Retorna '' se não houver nome utilizável. */
export function firstName(value: string | null | undefined): string {
  const title = toTitleCase(value);
  const first = title.split(' ')[0] ?? '';
  return /\p{L}/u.test(first) ? first : '';
}

/** Normaliza para comparação: minúsculo, sem acento, sem pontuação, sem partículas. */
export function normalizeForMatch(value: string | null | undefined): string {
  return cleanSpaces(
    (value ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' '),
  )
    .split(' ')
    .filter((w) => w && !LOWERCASE_PARTICLES.has(w))
    .join(' ');
}

function jaro(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const range = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aMatches = new Array<boolean>(a.length).fill(false);
  const bMatches = new Array<boolean>(b.length).fill(false);
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - range);
    const end = Math.min(i + range + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;
  let t = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) t++;
    k++;
  }
  return (matches / a.length + matches / b.length + (matches - t / 2) / matches) / 3;
}

export function jaroWinkler(a: string, b: string): number {
  const j = jaro(a, b);
  let prefix = 0;
  while (prefix < 4 && a[prefix] && a[prefix] === b[prefix]) prefix++;
  return j + prefix * 0.1 * (1 - j);
}

const TOKEN_MATCH = 0.95; // tolera erro de digitação ("Conceicao"/"Concecao"), não "Maria"/"Mariana"

/**
 * Similaridade (0–1) entre o nome da nota e o nome retornado pelo provedor (regra 7.1.6).
 * Cobertura de tokens: fração das palavras do nome mais curto presentes no mais longo,
 * exigindo que o primeiro nome bata — sobrenome omitido não derruba a nota, mas outra
 * pessoa com sobrenome parecido não passa. Primeiro nome diferente limita a nota a 0,5.
 */
export function nameSimilarity(a: string | null | undefined, b: string | null | undefined): number {
  const na = normalizeForMatch(a);
  const nb = normalizeForMatch(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ta = na.split(' ');
  const tb = nb.split(' ');
  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  const matches = (t: string) => long.some((l) => jaroWinkler(t, l) >= TOKEN_MATCH);
  const coverage = short.filter(matches).length / short.length;
  if (jaroWinkler(short[0]!, long[0]!) < TOKEN_MATCH) return Math.min(coverage, 0.5);
  return coverage;
}
