import { eq, sql } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'
import { validate, version } from 'uuid'
import { beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type TestDb } from '../testing'
import { notDeleted, ownedColumns } from './columns'

const notes = pgTable('test_notes', { ...ownedColumns(), title: text('title').notNull() })

const OWNER_A = '00000000-0000-7000-8000-00000000000a'
const OWNER_B = '00000000-0000-7000-8000-00000000000b'

describe('ownedColumns', () => {
  let db: TestDb

  beforeEach(async () => {
    db = await createTestDb()
    await db.execute(sql`
      create table test_notes (
        id uuid primary key, owner_id uuid not null, title text not null,
        created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
        deleted_at timestamptz
      )`)
  })

  it('generates a UUIDv7 id and timestamps on insert', async () => {
    const [row] = await db.insert(notes).values({ ownerId: OWNER_A, title: 'hi' }).returning()
    expect(row && validate(row.id) && version(row.id)).toBe(7)
    expect(row?.createdAt).toBeInstanceOf(Date)
    expect(row?.deletedAt).toBeNull()
  })

  it('generates time-ordered ids', async () => {
    const [first] = await db.insert(notes).values({ ownerId: OWNER_A, title: 'a' }).returning()
    const [second] = await db.insert(notes).values({ ownerId: OWNER_A, title: 'b' }).returning()
    expect(first && second && first.id < second.id).toBe(true)
  })

  it('bumps updatedAt on update', async () => {
    const [row] = await db.insert(notes).values({ ownerId: OWNER_A, title: 'a' }).returning()
    const [updated] = await db
      .update(notes)
      .set({ title: 'b' })
      .where(eq(notes.id, row?.id ?? ''))
      .returning()
    expect(updated && row && updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      row?.updatedAt.getTime() ?? 0,
    )
    expect(updated?.title).toBe('b')
  })

  it('notDeleted excludes soft-deleted rows', async () => {
    await db.insert(notes).values([
      { ownerId: OWNER_A, title: 'keep' },
      { ownerId: OWNER_B, title: 'gone', deletedAt: new Date() },
    ])
    const rows = await db.select().from(notes).where(notDeleted(notes))
    expect(rows.map((r) => r.title)).toEqual(['keep'])
  })
})
