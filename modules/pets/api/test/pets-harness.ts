import { authUsers } from '@brain/db'
import { createTestDb } from '@brain/db/testing'
import { createBuilder } from '@brain/graphql'
import { createMemoryStorage } from '@brain/storage'
import { graphql } from 'graphql'
import { registerPetsModule } from '../index'

type Result<T> = { data?: T | null; errors?: { message: string }[] }

/** Composed schema (core builder + pets) against in-memory Postgres; signs in as `alice` by default. */
export const createPetsHarness = async () => {
  const db = await createTestDb()
  const storage = createMemoryStorage()
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
  registerPetsModule(builder)
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
      contextValue: { db, storage, viewer: as ? { id: as } : null, requestId: 'test' },
    })
    return JSON.parse(JSON.stringify(result))
  }

  return { db, storage, run, alice, bob }
}

export const CREATE_PET = `
  mutation ($input: CreatePetInput!) {
    createPet(input: $input) {
      __typename
      ... on MutationCreatePetSuccess { data { id name species speciesOther sex breed birthDate notes photoUrl } }
      ... on ValidationError { code issues { path code } }
      ... on Error { code }
    }
  }`

export const createPet = async (
  run: Awaited<ReturnType<typeof createPetsHarness>>['run'],
  input: Record<string, unknown> = { name: 'Mango', species: 'CAT' },
  as?: string,
) => {
  const res = await run(CREATE_PET, { input }, as)
  return res.data?.createPet?.data?.id as string
}
