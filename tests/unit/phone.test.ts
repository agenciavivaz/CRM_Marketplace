import { describe, expect, it } from 'vitest';
import { formatPhone, isMaskedPhone, isMobile, maskPhone, parseBrPhone } from '@/lib/phone';

describe('phone', () => {
  it('normaliza celulares para E.164', () => {
    expect(parseBrPhone('(11) 98765-4321')?.e164).toBe('+5511987654321');
    expect(parseBrPhone('+55 11 98765-4321')?.e164).toBe('+5511987654321');
    expect(parseBrPhone('5511987654321')?.e164).toBe('+5511987654321');
    expect(parseBrPhone('011987654321')?.e164).toBe('+5511987654321');
  });

  it('adiciona o nono dígito em celular antigo', () => {
    expect(parseBrPhone('11 8765-4321')).toMatchObject({ e164: '+5511987654321', type: 'mobile' });
  });

  it('identifica fixo', () => {
    expect(parseBrPhone('(11) 3456-7890')).toMatchObject({ type: 'landline' });
    expect(isMobile('(11) 3456-7890')).toBe(false);
    expect(isMobile('(21) 99876-5432')).toBe(true);
  });

  it('rejeita inválidos e mascarados', () => {
    expect(parseBrPhone('(11) 9****-4321')).toBeNull();
    expect(parseBrPhone('11999999999')).toBeNull();
    expect(isMaskedPhone('11 9xxxx-1234')).toBe(true);
    expect(parseBrPhone('(00) 98765-4321')).toBeNull();
    expect(parseBrPhone('123')).toBeNull();
    expect(parseBrPhone(null)).toBeNull();
  });

  it('formata e mascara', () => {
    expect(formatPhone('+5511987654321')).toBe('(11) 98765-4321');
    expect(formatPhone('+551134567890')).toBe('(11) 3456-7890');
    expect(maskPhone('+5511987654321')).toBe('+5511****4321');
  });
});
