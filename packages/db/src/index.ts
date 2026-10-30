// Re-exported so apps/modules never depend on drizzle-orm directly (one shared instance).
export {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  lte,
  ne,
  or,
  sql,
} from 'drizzle-orm'
export { closeDb, createDb, type Database, withStrictSsl } from './client'
export * from './schema'
