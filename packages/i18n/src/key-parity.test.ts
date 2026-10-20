import { describe, expect, it } from 'vitest'
import { findMissingKeys } from './key-parity'

describe('findMissingKeys', () => {
  it('returns empty when both locales have the same nested keys', () => {
    expect(findMissingKeys({ a: { b: 'x' } }, { a: { b: 'y' } })).toEqual([])
  })

  it('returns dotted paths that exist in reference but not in target', () => {
    const reference = { a: { b: 'x', c: 'x' }, d: 'x' }
    const target = { a: { b: 'y' } }
    expect(findMissingKeys(reference, target)).toEqual(['a.c', 'd'])
  })

  it('treats a string where an object is expected as missing children', () => {
    expect(findMissingKeys({ a: { b: 'x' } }, { a: 'y' })).toEqual(['a.b'])
  })
})
