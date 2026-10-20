import { describe, expect, it } from 'vitest'
import { createDb } from './client'

describe('createDb', () => {
  it('creates a lazy drizzle client without connecting', () => {
    const db = createDb('postgres://user:pass@127.0.0.1:1/never')
    expect(typeof db.select).toBe('function')
    expect(typeof db.transaction).toBe('function')
  })
})
