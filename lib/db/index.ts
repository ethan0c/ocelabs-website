import 'server-only';
import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/*
 * Neon over HTTP: one fetch per query, no connection to hold, which is what
 * a serverless function wants. DATABASE_URL comes from the Neon integration
 * in Vercel (or .env locally).
 *
 * Connected lazily: `next build` imports every module to collect page data,
 * and a build machine has no database. The first query is what needs it.
 */
type DB = NeonHttpDatabase<typeof schema>;

let real: DB | undefined;

function connect(): DB {
  if (real) return real;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add the Neon integration in Vercel or put it in .env.');
  }
  real = drizzle(neon(url), { schema });
  return real;
}

export const db: DB = new Proxy({} as DB, {
  get(_, prop) {
    const target = connect();
    const value = Reflect.get(target, prop);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

export * from './schema';
