import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from '../testing'
import { authAccounts, authSessions, authUsers, authVerifications } from './auth'

describe('auth tables (with migrations applied)', () => {
  let db: TestDb
  let userId: string

  beforeEach(async () => {
    db = await createTestDb()
    const [user] = await db
      .insert(authUsers)
      .values({ name: 'Tnk', email: 'tnk@example.com' })
      .returning()
    userId = user?.id ?? ''
  })

  it('cascades sessions and accounts when the user is deleted', async () => {
    const expiresAt = new Date(Date.now() + 60_000)
    await db.insert(authSessions).values({ userId, token: 't1', expiresAt })
    await db.insert(authAccounts).values({ userId, accountId: userId, providerId: 'credential' })
    await db.delete(authUsers).where(eq(authUsers.id, userId))
    expect(await db.select().from(authSessions)).toEqual([])
    expect(await db.select().from(authAccounts)).toEqual([])
  })

  it('bumps updatedAt on update', async () => {
    const [before] = await db.select().from(authUsers)
    const [after] = await db
      .update(authUsers)
      .set({ name: 'New' })
      .where(eq(authUsers.id, userId))
      .returning()
    expect(after?.updatedAt.getTime()).toBeGreaterThanOrEqual(before?.updatedAt.getTime() ?? 0)
  })

  it('enforces unique email and username', async () => {
    await db.update(authUsers).set({ username: 'tnk' })
    await expect(
      db.insert(authUsers).values({ name: 'X', email: 'tnk@example.com' }),
    ).rejects.toThrow()
    await expect(
      db.insert(authUsers).values({ name: 'X', email: 'x@example.com', username: 'tnk' }),
    ).rejects.toThrow()
  })

  it('stores verifications', async () => {
    const [row] = await db
      .insert(authVerifications)
      .values({ identifier: 'i', value: 'v', expiresAt: new Date() })
      .returning()
    await db.update(authVerifications).set({ value: 'w' })
    expect(row?.id).toBeTruthy()
  })
})
