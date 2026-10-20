import { fileURLToPath } from 'node:url'
import { createBuilder } from '@brain/graphql'
import { lexicographicSortSchema, printSchema } from 'graphql'
import { registerHealth } from './core/health'

export const SCHEMA_PATH = fileURLToPath(import.meta.resolve('@brain/graphql/schema.graphql'))

/** Composes core + every enabled module into one schema. Register new modules here. */
export const buildApiSchema = () => {
  const builder = createBuilder()
  builder.queryType({})
  registerHealth(builder)
  // registerPetsModule(builder)  ← Phase 2
  return builder.toSchema()
}

export const printApiSchema = (): string =>
  `${printSchema(lexicographicSortSchema(buildApiSchema()))}\n`
