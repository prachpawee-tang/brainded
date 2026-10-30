import { describe, expect, it } from 'vitest'
import { createColorsHarness } from '../../../test/colors-harness'

const LIST = `{ colorFavorites { kind ref } }`
const SET = `mutation ($input: SetColorFavoriteInput!) {
  setColorFavorite(input: $input) {
    __typename
    ... on MutationSetColorFavoriteSuccess { data { kind ref } }
    ... on ValidationError { issues { path code } }
    ... on Error { code }
  }
}`

describe('color favorites', () => {
  it('adds and removes favorites idempotently, newest first', async () => {
    const { run } = await createColorsHarness()
    await run(SET, { input: { kind: 'COLOR', ref: 'hermosa-pink', isFavorite: true } })
    await run(SET, { input: { kind: 'COMBINATION', ref: '176', isFavorite: true } })
    const again = await run(SET, {
      input: { kind: 'COLOR', ref: 'hermosa-pink', isFavorite: true },
    })
    expect(again.data?.setColorFavorite.data).toEqual([
      { kind: 'COMBINATION', ref: '176' },
      { kind: 'COLOR', ref: 'hermosa-pink' },
    ])
    await run(SET, { input: { kind: 'COLOR', ref: 'hermosa-pink', isFavorite: false } })
    await run(SET, { input: { kind: 'COLOR', ref: 'hermosa-pink', isFavorite: false } })
    expect((await run(LIST)).data?.colorFavorites).toEqual([{ kind: 'COMBINATION', ref: '176' }])
    await run(SET, { input: { kind: 'COLOR', ref: 'hermosa-pink', isFavorite: true } })
    expect((await run(LIST)).data?.colorFavorites).toHaveLength(2)
  })

  it('rejects colors and combinations that are not in the book', async () => {
    const { run } = await createColorsHarness()
    for (const input of [
      { kind: 'COLOR', ref: 'not-a-color', isFavorite: true },
      { kind: 'COMBINATION', ref: '349', isFavorite: true },
      { kind: 'COMBINATION', ref: '1.5', isFavorite: true },
    ]) {
      expect((await run(SET, { input })).data?.setColorFavorite.issues).toEqual([
        { path: ['ref'], code: 'UNKNOWN_REF' },
      ])
    }
  })

  it('keeps favorites per user and needs a signed-in user', async () => {
    const { run, bob } = await createColorsHarness()
    await run(SET, { input: { kind: 'COLOR', ref: 'hermosa-pink', isFavorite: true } })
    expect((await run(LIST, {}, bob)).data?.colorFavorites).toEqual([])
    expect(
      (await run(SET, { input: { kind: 'COLOR', ref: 'hermosa-pink', isFavorite: true } }, null))
        .data?.setColorFavorite,
    ).toEqual({
      __typename: 'UnauthenticatedError',
      code: 'UNAUTHENTICATED',
    })
    expect((await run(LIST, {}, null)).errors).toBeDefined()
  })
})
