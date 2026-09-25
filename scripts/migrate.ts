import { readFileSync } from 'fs';
import { join } from 'path';
import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function migrate() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

  const sql = neon(process.env.DATABASE_URL);
  const schema = readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8');

  const statements = schema
    .split(/;/)
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter((s) => s.length > 0);

  let applied = 0;
  for (const stmt of statements) {
    await sql([stmt] as unknown as TemplateStringsArray);
    applied++;
  }

  console.log(`Migration complete. ${applied} statement(s) applied.`);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
