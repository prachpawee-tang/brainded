import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

/** Driver-agnostic database type. Services and repositories depend on this, never on a driver. */
export type Database = PgDatabase<PgQueryResultHKT>

export const createDb = (databaseUrl: string): Database =>
  drizzle(postgres(databaseUrl, { prepare: false }), { casing: 'snake_case' })
