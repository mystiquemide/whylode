import { neon, neonConfig, types, NeonQueryFunction } from '@neondatabase/serverless';
import ws from 'ws';

// Use WebSocket for environments that don't have a native one (Node.js).
neonConfig.webSocketConstructor = ws;

// BIGSERIAL ids come back as strings by default. Parse int8 as a number so ids
// compare correctly everywhere. Ids stay far below Number.MAX_SAFE_INTEGER.
types.setTypeParser(20, (value: string) => Number(value));

// Lazily resolve the connection so the module can be imported at build time
// without DATABASE_URL. The error surfaces when the first query runs.
let _db: NeonQueryFunction<false, false> | null = null;

function getDb(): NeonQueryFunction<false, false> {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    _db = neon(url) as NeonQueryFunction<false, false>;
  }
  return _db;
}

// sql is the tagged-template query function for single statements.
// The proxy target must be a function, or calling sql`...` throws.
export const sql: NeonQueryFunction<false, false> = new Proxy(
  function () {} as unknown as NeonQueryFunction<false, false>,
  {
    get(_target, prop) {
      return getDb()[prop as keyof NeonQueryFunction<false, false>];
    },
    apply(_target, _thisArg, args) {
      return (getDb() as unknown as (...a: unknown[]) => unknown)(...args);
    },
  },
);
