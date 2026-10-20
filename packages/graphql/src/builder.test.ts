import { graphql, printSchema } from 'graphql'
import { describe, expect, it } from 'vitest'
import { createBuilder } from './builder'
import { NotFoundError, ValidationError } from './errors'

const run = async (build: (b: ReturnType<typeof createBuilder>) => void, source: string) => {
  const builder = createBuilder()
  build(builder)
  const schema = builder.toSchema()
  const result = await graphql({ schema, source, contextValue: {} })
  // Round-trip through JSON: that is what clients receive over HTTP.
  return { schema, result: JSON.parse(JSON.stringify(result)) as typeof result }
}

describe('createBuilder', () => {
  it('serializes DateTime scalars as ISO strings', async () => {
    const { result } = await run(
      (b) =>
        b.queryType({
          fields: (t) => ({
            now: t.field({ type: 'DateTime', resolve: () => new Date('2026-01-02T03:04:05Z') }),
          }),
        }),
      '{ now }',
    )
    expect(result.data).toEqual({ now: '2026-01-02T03:04:05.000Z' })
  })

  it('round-trips LocalDate as YYYY-MM-DD and rejects other formats', async () => {
    const build = (b: ReturnType<typeof createBuilder>) =>
      b.queryType({
        fields: (t) => ({
          echo: t.field({
            type: 'LocalDate',
            args: { on: t.arg({ type: 'LocalDate', required: true }) },
            resolve: (_r, { on }) => on,
          }),
        }),
      })
    expect((await run(build, '{ echo(on: "2026-02-03") }')).result.data).toEqual({
      echo: '2026-02-03',
    })
    expect((await run(build, '{ echo(on: "03/02/2026") }')).result.errors).toBeDefined()
  })

  it('returns thrown AppErrors as typed error results with a code', async () => {
    const { result } = await run(
      (b) =>
        b.queryType({
          fields: (t) => ({
            pet: t.string({
              errors: { types: [NotFoundError] },
              resolve: () => {
                throw new NotFoundError('PET_NOT_FOUND')
              },
            }),
          }),
        }),
      '{ pet { __typename ... on QueryPetSuccess { data } ... on Error { code } } }',
    )
    expect(result.errors).toBeUndefined()
    expect(result.data).toEqual({ pet: { __typename: 'NotFoundError', code: 'PET_NOT_FOUND' } })
  })

  it('exposes validation issues with field paths and codes', async () => {
    const { result } = await run((b) => {
      b.queryType({ fields: (t) => ({ ok: t.boolean({ resolve: () => true }) }) })
      b.mutationType({
        fields: (t) => ({
          save: t.boolean({
            errors: { types: [ValidationError] },
            resolve: () => {
              throw new ValidationError([{ path: ['input', 'name'], code: 'TOO_SHORT' }])
            },
          }),
        }),
      })
    }, 'mutation { save { ... on ValidationError { code issues { path code } } } }')
    expect(result.data).toEqual({
      save: { code: 'VALIDATION_FAILED', issues: [{ path: ['input', 'name'], code: 'TOO_SHORT' }] },
    })
  })

  it('never exposes a message field on errors (no user-facing text from the API)', async () => {
    const { schema } = await run(
      (b) => b.queryType({ fields: (t) => ({ ok: t.boolean({ resolve: () => true }) }) }),
      '{ ok }',
    )
    expect(printSchema(schema)).not.toMatch(/interface Error \{[^}]*message/)
  })
})
