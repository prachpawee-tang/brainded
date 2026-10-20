import { drizzle } from 'drizzle-orm/node-postgres'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import { Pool } from 'pg'

/** Driver-agnostic database type. Services and repositories depend on this, never on a driver. */
export type Database = PgDatabase<PgQueryResultHKT>

/**
 * node-postgres pool — Neon's recommendation for long-running Node servers and for
 * Cloudflare Workers via Hyperdrive. Use the POOLED url (`DATABASE_URL`) here;
 * migrations use `DATABASE_URL_UNPOOLED` (see drizzle.config.ts).
 */
export const createDb = (databaseUrl: string): Database =>
  drizzle({
    client: new Pool({ connectionString: withStrictSsl(databaseUrl) }),
    casing: 'snake_case',
  })

/** pg already treats `require` as `verify-full`; make it explicit so behavior survives pg v9. */
export const withStrictSsl = (databaseUrl: string): string =>
  databaseUrl.replace(/([?&])sslmode=require\b/, '$1sslmode=verify-full')
