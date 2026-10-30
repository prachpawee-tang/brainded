import { describe, expect, it } from 'vitest'
import { closeDb, createDb, withStrictSsl } from './client'

describe('createDb', () => {
  it('creates a lazy drizzle client without connecting', () => {
    const db = createDb('postgres://user:pass@127.0.0.1:1/never')
    expect(typeof db.select).toBe('function')
    expect(typeof db.transaction).toBe('function')
  })

  it('closes its pool (Workers create one per request)', async () => {
    const db = createDb('postgres://user:pass@127.0.0.1:1/never')
    await expect(closeDb(db)).resolves.toBeUndefined()
  })
})

describe('withStrictSsl', () => {
  it('upgrades sslmode=require to verify-full (same behavior pg uses today, no warning)', () => {
    expect(withStrictSsl('postgresql://u:p@h/db?sslmode=require&channel_binding=require')).toBe(
      'postgresql://u:p@h/db?sslmode=verify-full&channel_binding=require',
    )
  })

  it('leaves urls without sslmode untouched', () => {
    expect(withStrictSsl('postgres://u:p@localhost/db')).toBe('postgres://u:p@localhost/db')
  })
})
