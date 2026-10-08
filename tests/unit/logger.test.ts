import { describe, expect, it, vi } from 'vitest';
import { logger, redact, redactString } from '@/lib/logger';

describe('logger — CPF nunca em logs', () => {
  it('remove CPF, telefone, e-mail e token de strings', () => {
    const s = redactString(
      'cpf 529.982.247-25 e 52998224725, tel (11) 98765-4321, a@b.com, Bearer abc.def',
    );
    expect(s).not.toMatch(/529|98765|a@b\.com|abc\.def/);
  });

  it('remove campos sensíveis por nome', () => {
    expect(redact({ cpf: 'x', nested: { access_token: 'y', ok: 1 } })).toEqual({
      cpf: '[redacted]',
      nested: { access_token: '[redacted]', ok: 1 },
    });
  });

  it('emite JSON sem dados pessoais', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('cliente 52998224725 importado', {
      org_id: 'o1',
      job: 'ingest',
      numeroDocumento: '52998224725',
    });
    const line = spy.mock.calls[0]?.[0] as string;
    spy.mockRestore();
    expect(JSON.parse(line)).toMatchObject({ level: 'info', org_id: 'o1', job: 'ingest' });
    expect(line).not.toContain('52998224725');
  });
});
