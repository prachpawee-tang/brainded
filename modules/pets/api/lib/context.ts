import type { Database } from '@brain/db'
import { decodeGlobalID, type GraphQLContext, requireViewer, ValidationError } from '@brain/graphql'
import type { ObjectStorage } from '@brain/storage'
import type { z } from 'zod'
import { toValidationIssues } from '../../shared/validation'

/** What services need: who is acting, and the infrastructure to act with. */
export type PetsServiceContext = { db: Database; storage: ObjectStorage; ownerId: string }

export const toServiceContext = (context: GraphQLContext): PetsServiceContext => ({
  db: context.db,
  storage: context.storage,
  ownerId: requireViewer(context).id,
})

/** Parses with a shared zod schema; throws a GraphQL ValidationError with code issues. */
export const parseOrThrow = <S extends z.ZodType>(schema: S, value: unknown): z.infer<S> => {
  const result = schema.safeParse(value)
  if (!result.success) throw new ValidationError(toValidationIssues(result.error))
  return result.data
}

/** Raw UUID from a Pet global ID, or null when malformed / wrong type. */
export const petIdFromGlobalId = (globalId: string): string | null => {
  try {
    const { typename, id } = decodeGlobalID(globalId)
    return typename === 'Pet' ? id : null
  } catch {
    return null
  }
}

export const encodeCursor = (parts: string[]): string =>
  Buffer.from(parts.join('|')).toString('base64url')
export const decodeCursor = (cursor: string | null | undefined, size: number): string[] | null => {
  if (!cursor) return null
  const parts = Buffer.from(cursor, 'base64url').toString().split('|')
  return parts.length === size && parts.every(Boolean) ? parts : null
}

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const pageSize = (first: number | null | undefined) =>
  Math.min(Math.max(first ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE)
