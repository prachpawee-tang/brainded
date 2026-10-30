import { describe, expect, it } from 'vitest'
import { favoriteInputSchema, toValidationIssues } from './validation'

describe('favoriteInputSchema', () => {
  it('accepts known colors and combination numbers', () => {
    expect(
      favoriteInputSchema.parse({ kind: 'COLOR', ref: 'hermosa-pink', isFavorite: true }),
    ).toBeTruthy()
    expect(
      favoriteInputSchema.parse({ kind: 'COMBINATION', ref: '348', isFavorite: false }),
    ).toBeTruthy()
  })

  it('flags unknown refs and kinds with codes', () => {
    const issues = (value: unknown) =>
      toValidationIssues(favoriteInputSchema.safeParse(value).error)
    expect(issues({ kind: 'COMBINATION', ref: '0', isFavorite: true })).toEqual([
      { path: ['ref'], code: 'UNKNOWN_REF' },
    ])
    expect(issues({ kind: 'PALETTE', ref: '1', isFavorite: true })).toEqual([
      { path: ['kind'], code: 'INVALID' },
    ])
  })
})
