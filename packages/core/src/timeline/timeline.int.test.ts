import { authUsers } from '@brain/db'
import { createTestDb, type TestDb } from '@brain/db/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  decodeTimelineCursor,
  encodeTimelineCursor,
  listTimelineEvents,
  recordTimelineEvent,
} from './timeline'

const PET = '0190f0f0-0000-7000-8000-0000000000aa'
const OTHER_PET = '0190f0f0-0000-7000-8000-0000000000bb'

describe('timeline', () => {
  let db: TestDb
  let ownerId: string
  let strangerId: string

  const record = (occurredOn: string, entityId = PET, owner = ownerId) =>
    recordTimelineEvent(db, {
      ownerId: owner,
      entityType: 'pets.pet',
      entityId,
      kind: 'pets.note.general',
      occurredOn,
      body: occurredOn,
    })

  beforeEach(async () => {
    db = await createTestDb()
    const users = await db
      .insert(authUsers)
      .values([
        { name: 'A', email: 'a@example.com' },
        { name: 'B', email: 'b@example.com' },
      ])
      .returning()
    ownerId = users[0]?.id ?? ''
    strangerId = users[1]?.id ?? ''
  })

  it('records an event with defaults', async () => {
    const event = await record('2026-01-02')
    expect(event).toMatchObject({
      kind: 'pets.note.general',
      occurredOn: '2026-01-02',
      data: {},
      body: '2026-01-02',
    })
  })

  it('lists newest first and paginates with a cursor', async () => {
    for (const day of ['2026-01-01', '2026-03-01', '2026-02-01']) await record(day)
    const first = await listTimelineEvents(db, {
      ownerId,
      entityType: 'pets.pet',
      entityId: PET,
      limit: 2,
    })
    expect(first.events.map((e) => e.occurredOn)).toEqual(['2026-03-01', '2026-02-01'])
    expect(first.hasNextPage).toBe(true)

    const after = decodeTimelineCursor(
      encodeTimelineCursor(first.events[1] as NonNullable<(typeof first.events)[1]>),
    )
    const second = await listTimelineEvents(db, {
      ownerId,
      entityType: 'pets.pet',
      entityId: PET,
      limit: 2,
      after,
    })
    expect(second.events.map((e) => e.occurredOn)).toEqual(['2026-01-01'])
    expect(second.hasNextPage).toBe(false)
  })

  it('orders same-day events by creation (newest first)', async () => {
    const a = await record('2026-01-01')
    const b = await record('2026-01-01')
    const { events } = await listTimelineEvents(db, {
      ownerId,
      entityType: 'pets.pet',
      entityId: PET,
      limit: 5,
    })
    expect(events.map((e) => e.id)).toEqual([b.id, a.id])
  })

  it('only returns events of that owner and entity', async () => {
    await record('2026-01-01')
    await record('2026-01-01', OTHER_PET)
    await record('2026-01-01', PET, strangerId)
    const { events } = await listTimelineEvents(db, {
      ownerId,
      entityType: 'pets.pet',
      entityId: PET,
      limit: 10,
    })
    expect(events).toHaveLength(1)
  })

  it('rejects malformed cursors', () => {
    expect(() => decodeTimelineCursor('nope')).toThrow('Invalid cursor')
  })
})
