import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  decrypt,
  decryptJson,
  encrypt,
  encryptJson,
  hashCpf,
  hmacSha256Hex,
  parseKey,
  rotateKey,
  safeEqual,
} from '@/lib/crypto';

const key = randomBytes(32);

describe('crypto (ADR-008)', () => {
  it('faz ida e volta e não repete o ciphertext', () => {
    const a = encrypt('segredo', key);
    const b = encrypt('segredo', key);
    expect(a).not.toEqual(b);
    expect(a.startsWith('v1:')).toBe(true);
    expect(decrypt(a, key)).toBe('segredo');
  });

  it('não contém o texto original', () => {
    expect(encrypt('access-token-123', key)).not.toContain('access-token-123');
  });

  it('falha com chave errada ou payload adulterado', () => {
    const enc = encrypt('x', key);
    expect(() => decrypt(enc, randomBytes(32))).toThrow();
    const parts = enc.split(':');
    parts[3] = Buffer.from('adulterado').toString('base64url');
    expect(() => decrypt(parts.join(':'), key)).toThrow();
    expect(() => decrypt('v0:a:b:c', key)).toThrow();
  });

  it('cifra JSON', () => {
    const v = { access_token: 'a', refresh_token: 'b', expires_in: 21600 };
    expect(decryptJson(encryptJson(v, key), key)).toEqual(v);
  });

  it('rotaciona a chave', () => {
    const newKey = randomBytes(32);
    const rotated = rotateKey(encrypt('token', key), key, newKey);
    expect(decrypt(rotated, newKey)).toBe('token');
    expect(() => decrypt(rotated, key)).toThrow();
  });

  it('exige chave de 32 bytes', () => {
    expect(() => parseKey(Buffer.from('curta').toString('base64'))).toThrow();
    expect(parseKey(randomBytes(32).toString('base64'))).toHaveLength(32);
  });

  it('hashCpf é determinístico, depende do pepper e ignora máscara', () => {
    const h = hashCpf('123.456.789-09', 'pepper');
    expect(h).toHaveLength(64);
    expect(hashCpf('12345678909', 'pepper')).toBe(h);
    expect(hashCpf('12345678909', 'outro')).not.toBe(h);
    expect(h).not.toContain('12345678909');
  });

  it('safeEqual e hmac', () => {
    const sig = hmacSha256Hex('s', 'body');
    expect(safeEqual(sig, hmacSha256Hex('s', 'body'))).toBe(true);
    expect(safeEqual(sig, hmacSha256Hex('s', 'bodx'))).toBe(false);
    expect(safeEqual(sig, 'curto')).toBe(false);
  });
});
