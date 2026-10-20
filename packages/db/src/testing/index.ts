import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'

export type TestDb = PgliteDatabase

const MIGRATIONS_FOLDER = join(import.meta.dirname, '../../migrations')

/** Fresh in-memory Postgres with all migrations applied. One per test (file) — no shared state. */
export const createTestDb = async (): Promise<TestDb> => {
  const db = drizzle(new PGlite(), { casing: 'snake_case' })
  if (existsSync(join(MIGRATIONS_FOLDER, 'meta/_journal.json'))) {
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })
  }
  return db
}
