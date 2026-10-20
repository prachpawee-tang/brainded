import { encodeGlobalID } from '@brain/graphql'
import { describe, expect, it } from 'vitest'
import { noteKind, toTimelineKind } from '../features/notes/notes.service'
import { decodeCursor, encodeCursor, pageSize, petIdFromGlobalId } from './context'

describe('petIdFromGlobalId', () => {
  it('accepts Pet ids only', () => {
    expect(petIdFromGlobalId(encodeGlobalID('Pet', 'abc'))).toBe('abc')
    expect(petIdFromGlobalId(encodeGlobalID('Viewer', 'abc'))).toBeNull()
    expect(petIdFromGlobalId('%%%')).toBeNull()
  })
})

describe('cursors', () => {
  it('round-trips and rejects wrong shapes', () => {
    expect(decodeCursor(encodeCursor(['a', 'b']), 2)).toEqual(['a', 'b'])
    expect(decodeCursor(encodeCursor(['a']), 2)).toBeNull()
    expect(decodeCursor(null, 2)).toBeNull()
  })
})

describe('pageSize', () => {
  it.each([
    [undefined, 20],
    [0, 1],
    [500, 100],
    [5, 5],
  ])('clamps %s to %d', (first, expected) => {
    expect(pageSize(first)).toBe(expected)
  })
})

describe('timeline kinds', () => {
  it('maps core kinds to GraphQL kinds', () => {
    expect(toTimelineKind('pets.weight')).toBe('WEIGHT')
    expect(toTimelineKind(noteKind('VET_VISIT'))).toBe('NOTE_VET_VISIT')
    expect(toTimelineKind('pets.future_thing')).toBe('NOTE_GENERAL')
  })
})
