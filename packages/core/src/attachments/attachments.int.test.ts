import { authUsers } from '@brain/db'
import { createTestDb, type TestDb } from '@brain/db/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { addAttachments, listAttachments, removeAttachmentsFor } from './attachments'

const ENTITY = '0190f0f0-0000-7000-8000-0000000000aa'
const OTHER = '0190f0f0-0000-7000-8000-0000000000bb'

describe('attachments', () => {
  let db: TestDb
  let ownerId: string

  beforeEach(async () => {
    db = await createTestDb()
    const [user] = await db
      .insert(authUsers)
      .values({ name: 'A', email: 'a@example.com' })
      .returning()
    ownerId = user?.id ?? ''
  })

  it('stores keys in order and lists them per entity', async () => {
    await addAttachments(db, {
      ownerId,
      entityType: 'pets.lab_result',
      entityId: ENTITY,
      storageKeys: ['k1', 'k2'],
    })
    await addAttachments(db, {
      ownerId,
      entityType: 'pets.lab_result',
      entityId: OTHER,
      storageKeys: ['k3'],
    })
    const byEntity = await listAttachments(db, {
      ownerId,
      entityType: 'pets.lab_result',
      entityIds: [ENTITY, OTHER],
    })
    expect(byEntity.get(ENTITY)?.map((a) => a.storageKey)).toEqual(['k1', 'k2'])
    expect(byEntity.get(OTHER)?.map((a) => a.storageKey)).toEqual(['k3'])
  })

  it('does nothing for an empty key list and returns an empty map for no ids', async () => {
    await addAttachments(db, {
      ownerId,
      entityType: 'pets.lab_result',
      entityId: ENTITY,
      storageKeys: [],
    })
    expect(
      (await listAttachments(db, { ownerId, entityType: 'pets.lab_result', entityIds: [] })).size,
    ).toBe(0)
  })

  it('soft-removes all attachments of an entity', async () => {
    await addAttachments(db, {
      ownerId,
      entityType: 'pets.lab_result',
      entityId: ENTITY,
      storageKeys: ['k1'],
    })
    await removeAttachmentsFor(db, { ownerId, entityType: 'pets.lab_result', entityId: ENTITY })
    expect(
      (
        await listAttachments(db, { ownerId, entityType: 'pets.lab_result', entityIds: [ENTITY] })
      ).get(ENTITY),
    ).toBeUndefined()
  })
})
