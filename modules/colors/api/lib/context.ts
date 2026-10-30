import type { Database } from '@brain/db'
import { type GraphQLContext, requireViewer, ValidationError } from '@brain/graphql'
import type { z } from 'zod'
import { toValidationIssues } from '../../shared/validation'

/** What services need: who is acting, and the database to act on. */
export type ColorsServiceContext = { db: Database; ownerId: string }

export const toServiceContext = (context: GraphQLContext): ColorsServiceContext => ({
  db: context.db,
  ownerId: requireViewer(context).id,
})

/** Parses with a shared zod schema; throws a GraphQL ValidationError with code issues. */
export const parseOrThrow = <S extends z.ZodType>(schema: S, value: unknown): z.infer<S> => {
  const result = schema.safeParse(value)
  if (!result.success) throw new ValidationError(toValidationIssues(result.error))
  return result.data
}
