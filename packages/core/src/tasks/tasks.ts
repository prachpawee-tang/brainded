import { and, asc, type Database, eq, notDeleted, sql, tasks } from '@brain/db'

export type Task = typeof tasks.$inferSelect

type Scope = { ownerId: string; id: string }
type EntityScope = { ownerId: string; entityType: string; entityId: string }

export const createTask = async (
  db: Database,
  input: EntityScope & { title: string; note?: string | null; dueOn?: string | null },
): Promise<Task> => {
  const [task] = await db
    .insert(tasks)
    .values({ ...input, note: input.note ?? null, dueOn: input.dueOn ?? null })
    .returning()
  if (!task) throw new Error('Failed to create task')
  return task
}

const ownTask = ({ ownerId, id }: Scope) =>
  and(eq(tasks.ownerId, ownerId), eq(tasks.id, id), notDeleted(tasks))

export const findTask = async (db: Database, scope: Scope): Promise<Task | null> => {
  const [task] = await db.select().from(tasks).where(ownTask(scope))
  return task ?? null
}

/** Dated tasks first (soonest/overdue first), undated last; then creation order. */
export const listTasks = (
  db: Database,
  { includeDone, ...entity }: EntityScope & { includeDone: boolean },
) =>
  db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.ownerId, entity.ownerId),
        eq(tasks.entityType, entity.entityType),
        eq(tasks.entityId, entity.entityId),
        notDeleted(tasks),
        includeDone ? undefined : sql`${tasks.completedAt} is null`,
      ),
    )
    .orderBy(sql`${tasks.dueOn} asc nulls last`, asc(tasks.id))

export const updateTask = async (
  db: Database,
  {
    title,
    note,
    dueOn,
    ...scope
  }: Scope & { title: string; note: string | null; dueOn: string | null },
): Promise<Task | null> => {
  const [task] = await db
    .update(tasks)
    .set({ title, note, dueOn })
    .where(ownTask(scope))
    .returning()
  return task ?? null
}

export const setTaskCompleted = async (
  db: Database,
  { isCompleted, ...scope }: Scope & { isCompleted: boolean },
): Promise<Task | null> => {
  const [task] = await db
    .update(tasks)
    .set({ completedAt: isCompleted ? new Date() : null })
    .where(ownTask(scope))
    .returning()
  return task ?? null
}

export const deleteTask = async (db: Database, scope: Scope): Promise<boolean> => {
  const rows = await db
    .update(tasks)
    .set({ deletedAt: new Date() })
    .where(ownTask(scope))
    .returning()
  return rows.length > 0
}
