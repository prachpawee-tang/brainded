// Re-exported so apps/modules never depend on drizzle-orm directly (one shared instance).
export { and, eq, isNull, or, sql } from 'drizzle-orm'
export { createDb, type Database, withStrictSsl } from './client'
export { notDeleted, ownedColumns } from './schema'
