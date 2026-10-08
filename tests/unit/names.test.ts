import { describe, expect, it } from 'vitest';
import { firstName, nameSimilarity, normalizeForMatch, toTitleCase } from '@/lib/names';

describe('names', () => {
  it('converte caixa alta para formato título', () => {
    expect(toTitleCase('MARIA DA SILVA SANTOS')).toBe('Maria da Silva Santos');
    expect(toTitleCase("  joão  d'ávila  ")).toBe("João D'Ávila");
    expect(toTitleCase('ANA-LUÍSA COSTA')).toBe('Ana-Luísa Costa');
  });

  it('usa só o primeiro nome', () => {
    expect(firstName('MARIA SILVA SANTOS')).toBe('Maria');
    expect(firstName('')).toBe('');
    expect(firstName('123 456')).toBe('');
  });

  it('normaliza para comparação', () => {
    expect(normalizeForMatch('José da Conceição')).toBe('jose conceicao');
  });

  it('similaridade alta para o mesmo nome e variações', () => {
    expect(nameSimilarity('MARIA SILVA SANTOS', 'Maria Silva Santos')).toBe(1);
    expect(nameSimilarity('Maria Santos', 'MARIA DA SILVA SANTOS')).toBeGreaterThanOrEqual(0.8);
    expect(nameSimilarity('José Conceição', 'JOSE CONCEICAO')).toBe(1);
  });

  it('similaridade baixa para pessoas diferentes', () => {
    expect(nameSimilarity('Maria Silva Santos', 'Carlos Pereira Lima')).toBeLessThan(0.8);
    expect(nameSimilarity('Maria Silva', 'Mariana Souza')).toBeLessThan(0.8);
    expect(nameSimilarity('', 'Maria')).toBe(0);
  });
});

describe('nameSimilarity — casos de borda', () => {
  it('tolera erro de digitação e ordem com primeiro nome igual', () => {
    expect(nameSimilarity('Jose Conceicao', 'José Concecao')).toBeGreaterThanOrEqual(0.8);
  });
  it('mesmo sobrenome, primeiro nome diferente', () => {
    expect(nameSimilarity('Ana Silva Santos', 'Paula Silva Santos')).toBeLessThan(0.8);
  });
});
