import { authUsers } from '@brain/db'
import { createTestDb } from '@brain/db/testing'
import { createBuilder } from '@brain/graphql'
import { createMemoryStorage } from '@brain/storage'
import { graphql } from 'graphql'
import { registerColorsModule } from '../index'

type Result<T> = { data?: T | null; errors?: { message: string }[] }

/** Composed schema (core builder + colors) against in-memory Postgres; signs in as `alice` by default. */
export const createColorsHarness = async () => {
  const db = await createTestDb()
  const users = await db
    .insert(authUsers)
    .values([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ])
    .returning()
  const alice = users[0]?.id ?? ''
  const bob = users[1]?.id ?? ''

  const builder = createBuilder()
  builder.queryType({})
  builder.mutationType({})
  registerColorsModule(builder)
  const schema = builder.toSchema()

  // biome-ignore lint/suspicious/noExplicitAny: test results are asserted structurally
  const run = async <T = Record<string, any>>(
    source: string,
    variables: Record<string, unknown> = {},
    as: string | null = alice,
  ): Promise<Result<T>> => {
    const result = await graphql({
      schema,
      source,
      variableValues: variables,
      contextValue: {
        db,
        storage: createMemoryStorage(),
        viewer: as ? { id: as } : null,
        requestId: 'test',
      },
    })
    return JSON.parse(JSON.stringify(result))
  }

  return { db, run, alice, bob }
}
