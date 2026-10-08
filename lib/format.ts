/** Formatação pt-BR (seção 14.12). Datas exibidas no fuso da org (padrão America/Sao_Paulo). */

export const DEFAULT_TZ = 'America/Sao_Paulo';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const int = new Intl.NumberFormat('pt-BR');

/** 1234.56 → "R$ 1.234,56" (com espaço normal, não NBSP, para consistência em testes e textos). */
export function formatMoney(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : (value ?? 0);
  return brl.format(Number.isFinite(n) ? n : 0).replace(/ /g, ' ');
}

export function formatNumber(value: number): string {
  return int.format(value);
}

export function formatDate(value: string | Date | null | undefined, timeZone = DEFAULT_TZ): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(
  value: string | Date | null | undefined,
  timeZone = DEFAULT_TZ,
): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** Pluralização simples: plural(1, 'cliente', 'clientes') → "1 cliente". */
export function plural(n: number, one: string, many: string): string {
  return `${formatNumber(n)} ${n === 1 ? one : many}`;
}
