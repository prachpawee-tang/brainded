import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from '../testing'
import { authUsers } from './auth'
import { userModules } from './user-modules'

describe('core_user_modules (with migrations applied)', () => {
  let db: TestDb
  let ownerId: string

  beforeEach(async () => {
    db = await createTestDb()
    const [user] = await db
      .insert(authUsers)
      .values({ name: 'Tnk', email: 'tnk@example.com' })
      .returning()
    ownerId = user?.id ?? ''
  })

  it('defaults to enabled with empty settings', async () => {
    const [row] = await db.insert(userModules).values({ ownerId, moduleId: 'pets' }).returning()
    expect(row).toMatchObject({ enabled: true, settings: {} })
  })

  it('allows one row per user and module', async () => {
    await db.insert(userModules).values({ ownerId, moduleId: 'pets' })
    await expect(db.insert(userModules).values({ ownerId, moduleId: 'pets' })).rejects.toThrow()
  })

  it('is deleted with its user', async () => {
    await db.insert(userModules).values({ ownerId, moduleId: 'pets' })
    await db.delete(authUsers).where(eq(authUsers.id, ownerId))
    expect(await db.select().from(userModules)).toEqual([])
  })

  it('gives new users Thai and system theme by default', async () => {
    const [user] = await db.select().from(authUsers)
    expect(user).toMatchObject({ locale: 'th', theme: 'system', emailVerified: false })
  })
})
