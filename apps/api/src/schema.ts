import { fileURLToPath } from 'node:url'
import { createBuilder } from '@brain/graphql'
import { registerColorsModule } from '@brain/module-colors/api'
import { registerPetsModule } from '@brain/module-pets/api'
import { lexicographicSortSchema, printSchema } from 'graphql'
import { registerHealth } from './core/health'
import { registerViewer } from './core/viewer'

export const SCHEMA_PATH = fileURLToPath(import.meta.resolve('@brain/graphql/schema.graphql'))

/** Composes core + every enabled module into one schema. Register new modules here. */
export const buildApiSchema = () => {
  const builder = createBuilder()
  builder.queryType({})
  builder.mutationType({})
  registerHealth(builder)
  registerViewer(builder)
  registerPetsModule(builder)
  registerColorsModule(builder)
  return builder.toSchema()
}

export const printApiSchema = (): string =>
  `${printSchema(lexicographicSortSchema(buildApiSchema()))}\n`
