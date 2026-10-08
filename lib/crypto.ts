import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

/**
 * ADR-008: credenciais criptografadas na aplicação com AES-256-GCM.
 * Formato: `v1:<iv>:<tag>:<ciphertext>` (base64url). A chave vem de ENCRYPTION_KEY
 * (32 bytes em base64) e nunca é gravada no banco nem no repositório.
 */

const VERSION = 'v1';
const IV_BYTES = 12;

export function parseKey(raw: string): Buffer {
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY precisa ter 32 bytes em base64 (openssl rand -base64 32)');
  }
  return key;
}

function defaultKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error('ENCRYPTION_KEY não configurada');
  return parseKey(raw);
}

export function encrypt(plaintext: string, key: Buffer = defaultKey()): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString('base64url'),
    tag.toString('base64url'),
    ct.toString('base64url'),
  ].join(':');
}

export function decrypt(payload: string, key: Buffer = defaultKey()): string {
  const [version, iv, tag, ct] = payload.split(':');
  if (version !== VERSION || !iv || !tag || ct === undefined) {
    throw new Error('Formato de credencial criptografada inválido');
  }
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ct, 'base64url')), decipher.final()]).toString(
    'utf8',
  );
}

export function encryptJson(value: unknown, key?: Buffer): string {
  return encrypt(JSON.stringify(value), key);
}

export function decryptJson<T>(payload: string, key?: Buffer): T {
  return JSON.parse(decrypt(payload, key)) as T;
}

/**
 * Rotação de chave: decifra com a chave antiga e cifra com a nova.
 * Procedimento completo em docs/adr/008-criptografia-de-credenciais.md.
 */
export function rotateKey(payload: string, oldKey: Buffer, newKey: Buffer): string {
  return encrypt(decrypt(payload, oldKey), newKey);
}

/** HMAC-SHA256 com pepper — usado para CPF (`cpf_hash`) e telefones em listas de supressão. */
export function hashWithPepper(value: string, pepper = process.env.CPF_HASH_PEPPER): string {
  if (!pepper) throw new Error('CPF_HASH_PEPPER não configurado');
  return createHmac('sha256', pepper).update(value).digest('hex');
}

export function hashCpf(cpf: string, pepper?: string): string {
  return hashWithPepper(cpf.replace(/\D/g, ''), pepper);
}

/** Comparação em tempo constante para assinaturas de webhook. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function hmacSha256Hex(secret: string, body: string | Buffer): string {
  return createHmac('sha256', secret).update(body).digest('hex');
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}
