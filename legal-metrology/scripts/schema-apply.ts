/**
 * Apply the Supabase schema + seed directly over Postgres.
 *
 * Usage:
 *   DATABASE_URL=postgres://... npm run schema-apply
 *   npm run schema-apply -- --url "postgres://..."
 *
 * Reads the connection string from the DATABASE_URL env var (or --url),
 * then executes the migration and seed scripts in order. Both scripts are
 * written to be safe to re-run (IF NOT EXISTS / ON CONFLICT / CREATE OR REPLACE).
 *
 * IMPORTANT: never commit a DATABASE_URL / connection string.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

async function loadEnvLocal(): Promise<void> {
  const p = path.resolve(process.cwd(), '.env.local');
  try {
    const content = await readFile(p, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // rely on shell env
  }
}

async function main(): Promise<void> {
  await loadEnvLocal();
  const argv = process.argv.slice(2);
  const urlArg = argv[argv.indexOf('--url') + 1];
  const conn = urlArg ?? process.env.DATABASE_URL;

  if (!conn) {
    console.error(
      'No connection string. Provide it via DATABASE_URL env var or --url "postgres://...".'
    );
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: conn });
  await client.connect();
  console.log('Connected.');

  const scripts = [
    { file: 'supabase/migrations/001_initial_schema.sql', label: 'schema' },
    { file: 'supabase/seed.sql', label: 'seed' },
  ];

  try {
    for (const s of scripts) {
      const absolute = path.resolve(process.cwd(), s.file);
      const sql = await readFile(absolute, 'utf-8');
      console.log(`Applying ${s.label} (${s.file})...`);
      await client.query(sql);
      console.log(`  ${s.label}: OK`);
    }

    // Verify a couple of key tables exist.
    const { rows } = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema='public'
       ORDER BY table_name`
    );
    const names = rows.map((r: { table_name: string }) => r.table_name);
    console.log(`\nTables in public schema: ${names.length ? names.join(', ') : '(none)'}`);

    const { rows: ruleRows } = await client.query('SELECT count(*)::int AS n FROM public.rules');
    console.log(`Rules seeded: ${ruleRows[0].n}`);
  } catch (err) {
    console.error('Apply failed:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});