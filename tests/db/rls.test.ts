import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Client } from 'pg';
import { runRlsCheck, startTestDb, type TestDb } from './harness';

let db: TestDb;
let client: Client;

beforeAll(async () => {
  db = await startTestDb();
  client = await db.connect();
});

afterAll(async () => {
  await client?.end();
  await db?.stop();
});

describe('RLS — isolamento entre organizações (R1)', () => {
  it('nenhum usuário lê ou escreve dados de outra org', async () => {
    const result = await runRlsCheck(client);
    expect(result).toMatch(/^RLS_OK/);
  });

  it('a variante remota (usada no projeto real) também passa', async () => {
    expect(await runRlsCheck(client, 'rls_check_remote.sql')).toMatch(/^RLS_OK/);
  });

  it('o teste não deixa dados para trás', async () => {
    const { rows } = await client.query(
      "select count(*)::int as n from public.organizations where name like 'RLS Loja%'",
    );
    expect(rows[0].n).toBe(0);
  });

  it('detecta uma policy quebrada (o teste de RLS realmente morde)', async () => {
    await client.query('begin');
    try {
      await client.query('drop policy audit_log_select on public.audit_log');
      await client.query(
        'create policy audit_log_select on public.audit_log for select to authenticated using (true)',
      );
      const result = await runRlsCheck(client);
      expect(result).toMatch(/^RLS_FAIL/);
      expect(result).toContain('audit_log: B leu');
    } finally {
      await client.query('rollback');
    }
  });

  it('detecta tabela nova com org_id sem RLS e sem fixture', async () => {
    await client.query('begin');
    try {
      await client.query('create table public.rls_probe (id int, org_id uuid)');
      const result = await runRlsCheck(client);
      expect(result).toContain('rls_probe: tabela com org_id sem fixture');
      expect(result).toContain('rls_probe: RLS desabilitada');
    } finally {
      await client.query('rollback');
    }
  });

  it('create_organization exige login e gera slug único', async () => {
    await client.query('begin');
    try {
      const { rows: users } = await client.query(
        "insert into auth.users (email) values ('slug@example.test') returning id",
      );
      await client.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify({ sub: users[0].id, role: 'authenticated' }),
      ]);
      await client.query('set local role authenticated');
      const a = await client.query(
        "select slug from public.create_organization('Casa da Maria & Cia')",
      );
      const b = await client.query(
        "select slug from public.create_organization('Casa da María & Cia')",
      );
      expect(a.rows[0].slug).toBe('casa-da-maria-cia');
      expect(b.rows[0].slug).toMatch(/^casa-da-maria-cia-[0-9a-f]{4}$/);
      const { rows: m } = await client.query('select role from public.memberships');
      expect(m.map((r) => r.role)).toEqual(['owner', 'owner']);
      await client.query('reset role');
      await client.query(`select set_config('request.jwt.claims', '', true)`);
      await client.query('set local role authenticated');
      await expect(client.query("select public.create_organization('x')")).rejects.toThrow(
        /not_authenticated/,
      );
    } finally {
      await client.query('rollback');
    }
  });
});
