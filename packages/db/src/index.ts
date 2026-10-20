// Re-exported so apps/modules never depend on drizzle-orm directly (one shared instance).
export { and, asc, desc, eq, getTableColumns, gt, inArray, isNull, lt, or, sql } from 'drizzle-orm'
export { createDb, type Database, withStrictSsl } from './client'
export * from './schema'
