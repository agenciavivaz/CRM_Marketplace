import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';

/**
 * Sobe um Postgres descartável (binários locais) com o shim do Supabase e todas as migrations.
 * Se DATABASE_URL_TEST estiver definida, usa esse banco em vez de criar um cluster.
 */

const PG_BIN_CANDIDATES = [
  process.env.PG_BIN,
  '/usr/lib/postgresql/17/bin',
  '/usr/lib/postgresql/16/bin',
  '/usr/lib/postgresql/15/bin',
  '/opt/homebrew/bin',
  '/usr/local/bin',
].filter(Boolean) as string[];

function pgBin(): string {
  const dir = PG_BIN_CANDIDATES.find((d) => existsSync(join(d, 'initdb')));
  if (!dir)
    throw new Error('Binários do Postgres não encontrados. Defina PG_BIN ou DATABASE_URL_TEST.');
  return dir;
}

export const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

export function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => join(MIGRATIONS_DIR, f));
}

export interface TestDb {
  connect(): Promise<Client>;
  stop(): Promise<void>;
}

export async function startTestDb(): Promise<TestDb> {
  if (process.env.DATABASE_URL_TEST) {
    const url = process.env.DATABASE_URL_TEST;
    return { connect: async () => connectWithRetry(url), stop: async () => {} };
  }

  const bin = pgBin();
  const dataDir = mkdtempSync(join(tmpdir(), 'crm-pg-'));
  const port = 54000 + Math.floor(Math.random() * 1000);
  // initdb se recusa a rodar como root; nesse caso usamos o usuário postgres do sistema.
  const asRoot = process.getuid?.() === 0;
  const run = (cmd: string, args: string[]) =>
    asRoot
      ? execFileSync('runuser', ['-u', 'postgres', '--', join(bin, cmd), ...args], {
          stdio: 'pipe',
        })
      : execFileSync(join(bin, cmd), args, { stdio: 'pipe' });

  if (asRoot) execFileSync('chown', ['postgres', dataDir]);
  run('initdb', [
    '-D',
    dataDir,
    '-U',
    'postgres',
    '--auth=trust',
    '-E',
    'UTF8',
    '--locale=C.UTF-8',
  ]);

  const args = [
    '-D',
    dataDir,
    '-p',
    String(port),
    '-k',
    dataDir,
    '-c',
    'listen_addresses=',
    '-c',
    'fsync=off',
  ];
  const proc: ChildProcess = asRoot
    ? spawn('runuser', ['-u', 'postgres', '--', join(bin, 'postgres'), ...args], {
        stdio: 'ignore',
      })
    : spawn(join(bin, 'postgres'), args, { stdio: 'ignore' });

  const url = `postgresql://postgres@localhost:${port}/postgres?host=${encodeURIComponent(dataDir)}`;
  const admin = await connectWithRetry(url);
  await admin.query(readFileSync(join(process.cwd(), 'tests', 'db', 'supabase-shim.sql'), 'utf8'));
  for (const file of migrationFiles()) {
    try {
      await admin.query(readFileSync(file, 'utf8'));
    } catch (err) {
      throw new Error(`Falha ao aplicar ${file}: ${(err as Error).message}`);
    }
  }
  await admin.end();

  return {
    connect: () => connectWithRetry(url),
    stop: async () => {
      const exited = new Promise((r) => (proc.exitCode !== null ? r(null) : proc.once('exit', r)));
      try {
        run('pg_ctl', ['stop', '-D', dataDir, '-m', 'fast', '-w']);
      } catch {
        proc.kill('SIGKILL');
      }
      await exited;
      rmSync(dataDir, { recursive: true, force: true });
    },
  };
}

async function connectWithRetry(url: string, attempts = 50): Promise<Client> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const client = new Client({ connectionString: url });
    try {
      await client.connect();
      return client;
    } catch (err) {
      lastErr = err;
      await client.end().catch(() => {});
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw lastErr;
}

/** Executa o rls_check.sql e devolve a mensagem final (RLS_OK… ou RLS_FAIL…). */
export async function runRlsCheck(client: Client, file = 'rls_check.sql'): Promise<string> {
  const sql = readFileSync(join(process.cwd(), 'supabase', 'tests', file), 'utf8');
  try {
    await client.query(sql);
    return 'RLS_FAIL: o bloco terminou sem exceção';
  } catch (err) {
    return (err as Error).message;
  }
}
