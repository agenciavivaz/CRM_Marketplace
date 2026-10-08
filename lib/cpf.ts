/** Utilitários de documento (CPF/CNPJ). CPF nunca deve ir para logs — use `maskCpf` ou `hashCpf`. */

export function onlyDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function isValidCpf(value: string | null | undefined): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digits = cpf.split('').map(Number);
  const dv = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += digits[i]! * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return dv(9) === digits[9] && dv(10) === digits[10];
}

export function isValidCnpj(value: string | null | undefined): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const digits = cnpj.split('').map(Number);
  const calc = (len: number) => {
    const weights =
      len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + w * digits[i]!, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc(12) === digits[12] && calc(13) === digits[13];
}

export type DocumentKind = 'cpf' | 'cnpj' | 'invalid' | 'missing';

export function classifyDocument(value: string | null | undefined): {
  kind: DocumentKind;
  digits: string;
} {
  const digits = onlyDigits(value);
  if (!digits) return { kind: 'missing', digits };
  if (digits.length === 11) return { kind: isValidCpf(digits) ? 'cpf' : 'invalid', digits };
  if (digits.length === 14) return { kind: isValidCnpj(digits) ? 'cnpj' : 'invalid', digits };
  return { kind: 'invalid', digits };
}

/** `12345678909` → `***.456.789-**` (seção 15). */
export function maskCpf(value: string | null | undefined): string {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return '***.***.***-**';
  return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

export function formatCpf(value: string): string {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return value;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

export function formatCnpj(value: string): string {
  const c = onlyDigits(value);
  if (c.length !== 14) return value;
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
}

/** Gera um CPF sintético válido a partir de 9 dígitos base (usado no seed e nos testes). */
export function cpfFromBase(base9: string): string {
  const d = onlyDigits(base9).padStart(9, '0').slice(0, 9).split('').map(Number);
  const dv = (arr: number[]) => {
    const len = arr.length;
    const sum = arr.reduce((acc, n, i) => acc + n * (len + 1 - i), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  d.push(dv(d));
  d.push(dv(d));
  return d.join('');
}
