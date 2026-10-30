import { authUsers } from '@brain/db'
import { createTestDb, type TestDb } from '@brain/db/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { createTask, deleteTask, findTask, listTasks, setTaskCompleted, updateTask } from './tasks'

const PET = '0190f0f0-0000-7000-8000-0000000000aa'
const ENTITY = { entityType: 'pets.pet', entityId: PET }

describe('tasks', () => {
  let db: TestDb
  let ownerId: string
  let strangerId: string

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

  it('creates and lists open tasks: overdue/dated first by date, undated last', async () => {
    await createTask(db, { ownerId, ...ENTITY, title: 'no date' })
    await createTask(db, { ownerId, ...ENTITY, title: 'later', dueOn: '2026-12-01' })
    await createTask(db, { ownerId, ...ENTITY, title: 'soon', dueOn: '2026-11-01' })
    const open = await listTasks(db, { ownerId, ...ENTITY, includeDone: false })
    expect(open.map((t) => t.title)).toEqual(['soon', 'later', 'no date'])
  })

  it('completes, reopens and hides done tasks unless asked', async () => {
    const task = await createTask(db, { ownerId, ...ENTITY, title: 'buy flea drops' })
    const done = await setTaskCompleted(db, { ownerId, id: task.id, isCompleted: true })
    expect(done?.completedAt).toBeInstanceOf(Date)
    expect(await listTasks(db, { ownerId, ...ENTITY, includeDone: false })).toEqual([])
    expect(await listTasks(db, { ownerId, ...ENTITY, includeDone: true })).toHaveLength(1)
    const reopened = await setTaskCompleted(db, { ownerId, id: task.id, isCompleted: false })
    expect(reopened?.completedAt).toBeNull()
  })

  it('updates and soft-deletes, scoped to the owner', async () => {
    const task = await createTask(db, { ownerId, ...ENTITY, title: 'old' })
    expect(
      await updateTask(db, {
        ownerId: strangerId,
        id: task.id,
        title: 'x',
        note: null,
        dueOn: null,
      }),
    ).toBeNull()
    const updated = await updateTask(db, {
      ownerId,
      id: task.id,
      title: 'new',
      note: 'n',
      dueOn: '2026-11-02',
    })
    expect(updated).toMatchObject({ title: 'new', note: 'n', dueOn: '2026-11-02' })
    expect(await findTask(db, { ownerId: strangerId, id: task.id })).toBeNull()
    expect(
      await setTaskCompleted(db, { ownerId: strangerId, id: task.id, isCompleted: true }),
    ).toBeNull()
    expect(await deleteTask(db, { ownerId: strangerId, id: task.id })).toBe(false)
    expect(await deleteTask(db, { ownerId, id: task.id })).toBe(true)
    expect(await findTask(db, { ownerId, id: task.id })).toBeNull()
  })
})
