import { createBuilder } from '@brain/graphql'
import { registerColorsModule } from '@brain/module-colors/api'
import { registerPetsModule } from '@brain/module-pets/api'
import { lexicographicSortSchema, printSchema } from 'graphql'
import { registerHealth } from './core/health'
import { registerViewer } from './core/viewer'

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

let cachedSchema: ReturnType<typeof buildApiSchema> | undefined

/** Built once per process/isolate: Workers create the app per request, the schema never changes. */
export const getApiSchema = () => {
  cachedSchema ??= buildApiSchema()
  return cachedSchema
}

export const printApiSchema = (): string =>
  `${printSchema(lexicographicSortSchema(buildApiSchema()))}\n`
