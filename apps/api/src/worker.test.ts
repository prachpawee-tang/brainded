import { describe, expect, it, vi } from 'vitest'
import { isApiPath } from './worker'

vi.mock('pg')

describe('isApiPath', () => {
  it.each([
    ['/graphql', true],
    ['/api/auth/get-session', true],
    ['/api/files', true],
    ['/healthz', true],
    ['/', false],
    ['/pets/abc', false],
    ['/apiary', false],
  ])('%s → %s', (path, expected) => {
    expect(isApiPath(path)).toBe(expected)
  })
})
