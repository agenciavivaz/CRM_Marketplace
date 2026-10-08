import { describe, expect, it } from 'vitest';
import { formatDate, formatMoney, plural } from '@/lib/format';

describe('format', () => {
  it('moeda em pt-BR', () => {
    expect(formatMoney(1234.56)).toBe('R$ 1.234,56');
    expect(formatMoney('48.2')).toBe('R$ 48,20');
    expect(formatMoney(null)).toBe('R$ 0,00');
  });

  it('data dd/mm/aaaa no fuso de São Paulo', () => {
    expect(formatDate('2026-10-08T02:00:00Z')).toBe('07/10/2026');
    expect(formatDate(null)).toBe('—');
  });

  it('plural', () => {
    expect(plural(1, 'cliente', 'clientes')).toBe('1 cliente');
    expect(plural(1312, 'cliente', 'clientes')).toBe('1.312 clientes');
  });
});
