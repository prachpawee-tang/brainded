import SchemaBuilder from '@pothos/core'
import ErrorsPlugin from '@pothos/plugin-errors'
import RelayPlugin from '@pothos/plugin-relay'
import { DateTimeResolver } from 'graphql-scalars'
import type { GraphQLContext } from './context'
import {
  type AppError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  type ValidationIssue,
} from './errors'

export type BuilderTypes = {
  Context: GraphQLContext
  // Fields are non-null unless declared `nullable: true` — keeps client types honest.
  DefaultFieldNullability: false
  Scalars: {
    DateTime: { Input: Date; Output: Date }
    ID: { Input: string; Output: string | number }
  }
}

/**
 * Creates a fresh Pothos builder with shared scalars and error types.
 * apps/api creates ONE and passes it to every module's `register*Module(builder)`.
 */
export const createBuilder = () => {
  const builder = new SchemaBuilder<BuilderTypes>({
    plugins: [ErrorsPlugin, RelayPlugin],
    defaultFieldNullability: false,
    relay: { cursorType: 'String' },
    errors: { defaultTypes: [] },
  })

  builder.addScalarType('DateTime', DateTimeResolver)

  const ErrorInterface = builder.interfaceRef<AppError>('Error').implement({
    fields: (t) => ({ code: t.exposeString('code') }),
  })

  for (const ErrorClass of [NotFoundError, ForbiddenError]) {
    builder.objectType(ErrorClass, {
      name: ErrorClass.name,
      interfaces: [ErrorInterface],
      isTypeOf: (value) => value instanceof ErrorClass,
    })
  }

  const ValidationIssueRef = builder.objectRef<ValidationIssue>('ValidationIssue').implement({
    fields: (t) => ({
      path: t.stringList({ resolve: (issue) => issue.path.map(String) }),
      code: t.exposeString('code'),
    }),
  })

  builder.objectType(ValidationError, {
    name: 'ValidationError',
    interfaces: [ErrorInterface],
    isTypeOf: (value) => value instanceof ValidationError,
    fields: (t) => ({
      issues: t.field({ type: [ValidationIssueRef], resolve: (error) => error.issues }),
    }),
  })

  return builder
}

export type Builder = ReturnType<typeof createBuilder>
