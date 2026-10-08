/**
 * Logs estruturados em JSON (seção 10.9). Nunca registrar CPF, telefone, token ou e-mail:
 * `redact` remove esses padrões de qualquer string e campos sensíveis por nome.
 */

const SENSITIVE_KEYS =
  /^(cpf|cpf_hash|document|numeroDocumento|phone|telefone|celular|email|token|access_token|refresh_token|authorization|password|secret|credentials.*|code)$/i;

const PATTERNS: [RegExp, string][] = [
  [/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[cpf]'],
  [/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, '[cnpj]'],
  [/\+?\b55\s?\(?\d{2}\)?\s?9?\d{4}-?\d{4}\b/g, '[phone]'],
  [/\(?\b\d{2}\)?\s?9\d{4}-?\d{4}\b/g, '[phone]'],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]'],
  [/Bearer\s+[\w.-]+/gi, 'Bearer [token]'],
];

export function redactString(value: string): string {
  return PATTERNS.reduce((acc, [re, rep]) => acc.replace(re, rep), value);
}

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[depth]';
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value instanceof Error) return { name: value.name, message: redactString(value.message) };
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        SENSITIVE_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1),
      ]),
    );
  }
  return value;
}

type Level = 'debug' | 'info' | 'warn' | 'error';

export interface LogFields {
  org_id?: string | null;
  job?: string;
  duration_ms?: number;
  outcome?: string;
  [key: string]: unknown;
}

function emit(level: Level, msg: string, fields: LogFields = {}) {
  const line = JSON.stringify({
    level,
    msg: redactString(msg),
    ts: new Date().toISOString(),
    ...(redact(fields) as object),
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (msg: string, f?: LogFields) => process.env.LOG_LEVEL === 'debug' && emit('debug', msg, f),
  info: (msg: string, f?: LogFields) => emit('info', msg, f),
  warn: (msg: string, f?: LogFields) => emit('warn', msg, f),
  error: (msg: string, f?: LogFields) => emit('error', msg, f),
};
