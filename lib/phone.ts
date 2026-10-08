import { onlyDigits } from './cpf';

export type PhoneType = 'mobile' | 'landline';

export interface ParsedPhone {
  e164: string; // +5511987654321
  ddd: string;
  number: string;
  type: PhoneType;
}

const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Números mascarados por marketplace ("(11) 9****-1234", "11999999999" de placeholder etc.). */
export function isMaskedPhone(raw: string | null | undefined): boolean {
  if (!raw) return false;
  if (/[*xX#]/.test(raw)) return true;
  const digits = onlyDigits(raw).replace(/^55(?=\d{10,11}$)/, '');
  const local = digits.slice(2);
  return local.length >= 8 && /^(\d)\1+$/.test(local);
}

/** Normaliza telefone brasileiro para E.164. Retorna null se inválido ou mascarado. */
export function parseBrPhone(raw: string | null | undefined): ParsedPhone | null {
  if (!raw || isMaskedPhone(raw)) return null;
  let digits = onlyDigits(raw);
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55'))
    digits = digits.slice(2);
  if (digits.length !== 10 && digits.length !== 11) return null;

  const ddd = digits.slice(0, 2);
  if (!VALID_DDDS.has(Number(ddd))) return null;
  let number = digits.slice(2);

  let type: PhoneType;
  if (number.length === 9) {
    if (number[0] !== '9') return null;
    type = 'mobile';
  } else if (/^[6-9]/.test(number)) {
    // celular antigo sem o nono dígito
    number = `9${number}`;
    type = 'mobile';
  } else if (/^[2-5]/.test(number)) {
    type = 'landline';
  } else {
    return null;
  }
  return { e164: `+55${ddd}${number}`, ddd, number, type };
}

export function isMobile(raw: string | null | undefined): boolean {
  return parseBrPhone(raw)?.type === 'mobile';
}

/** `+5511987654321` → `(11) 98765-4321` */
export function formatPhone(e164OrRaw: string): string {
  const p = parseBrPhone(e164OrRaw);
  if (!p) return e164OrRaw;
  const n = p.number;
  return n.length === 9
    ? `(${p.ddd}) ${n.slice(0, 5)}-${n.slice(5)}`
    : `(${p.ddd}) ${n.slice(0, 4)}-${n.slice(4)}`;
}

/** Para logs: `+55119****4321`. */
export function maskPhone(e164: string): string {
  const d = onlyDigits(e164);
  if (d.length < 8) return '****';
  return `+${d.slice(0, 4)}****${d.slice(-4)}`;
}
