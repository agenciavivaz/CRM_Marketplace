import { describe, expect, it } from 'vitest';
import {
  classifyDocument,
  cpfFromBase,
  formatCpf,
  isValidCnpj,
  isValidCpf,
  maskCpf,
} from '@/lib/cpf';

describe('cpf', () => {
  it('valida dígitos verificadores', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('52998224724')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('123')).toBe(false);
    expect(isValidCpf(null)).toBe(false);
  });

  it('valida CNPJ', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
    expect(isValidCnpj('11.222.333/0001-82')).toBe(false);
  });

  it('classifica documentos', () => {
    expect(classifyDocument('529.982.247-25').kind).toBe('cpf');
    expect(classifyDocument('11222333000181').kind).toBe('cnpj');
    expect(classifyDocument('529.982.247-24').kind).toBe('invalid');
    expect(classifyDocument('').kind).toBe('missing');
    expect(classifyDocument(undefined).kind).toBe('missing');
  });

  it('mascara como na seção 15', () => {
    expect(maskCpf('12345678909')).toBe('***.456.789-**');
    expect(maskCpf('x')).toBe('***.***.***-**');
  });

  it('formata e gera CPF sintético válido', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
    for (const base of ['000000001', '123456789', '987654321']) {
      expect(isValidCpf(cpfFromBase(base))).toBe(true);
    }
  });
});
