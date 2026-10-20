import { and, asc, attachments, type Database, eq, inArray, notDeleted } from '@brain/db'

export type Attachment = typeof attachments.$inferSelect

type EntityRef = { ownerId: string; entityType: string; entityId: string }

/** Links already-uploaded storage keys to an entity, preserving order. Caller verifies key ownership. */
export const addAttachments = async (
  db: Database,
  { storageKeys, ...entity }: EntityRef & { storageKeys: readonly string[] },
) => {
  if (storageKeys.length === 0) return []
  return db
    .insert(attachments)
    .values(storageKeys.map((storageKey, position) => ({ ...entity, storageKey, position })))
    .returning()
}

export const listAttachments = async (
  db: Database,
  {
    ownerId,
    entityType,
    entityIds,
  }: { ownerId: string; entityType: string; entityIds: readonly string[] },
): Promise<Map<string, Attachment[]>> => {
  const byEntity = new Map<string, Attachment[]>()
  if (entityIds.length === 0) return byEntity
  const rows = await db
    .select()
    .from(attachments)
    .where(
      and(
        eq(attachments.ownerId, ownerId),
        eq(attachments.entityType, entityType),
        inArray(attachments.entityId, [...entityIds]),
        notDeleted(attachments),
      ),
    )
    .orderBy(asc(attachments.position))
  for (const row of rows) byEntity.set(row.entityId, [...(byEntity.get(row.entityId) ?? []), row])
  return byEntity
}

export const removeAttachmentsFor = async (
  db: Database,
  { ownerId, entityType, entityId }: EntityRef,
) => {
  await db
    .update(attachments)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(attachments.ownerId, ownerId),
        eq(attachments.entityType, entityType),
        eq(attachments.entityId, entityId),
      ),
    )
}
