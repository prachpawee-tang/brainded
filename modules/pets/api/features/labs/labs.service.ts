import {
  addAttachments,
  listAttachments,
  recordTimelineEvent,
  removeAttachmentsFor,
} from '@brain/core/server'
import { and, asc, desc, eq, inArray, notDeleted } from '@brain/db'
import { ForbiddenError, NotFoundError } from '@brain/graphql'
import { labResultInputSchema } from '../../../shared/health'
import { petLabResults, petLabValues } from '../../db/schema'
import { type PetsServiceContext, parseOrThrow } from '../../lib/context'
import { requirePet } from '../profile/profile.service'
import { PET_ENTITY_TYPE } from '../weight/weight.service'

export const LAB_RESULT_ENTITY_TYPE = 'pets.lab_result'
const LAB_RESULT_EVENT_KIND = 'pets.lab_result'
const DEFAULT_LIMIT = 20

export type LabResultRow = typeof petLabResults.$inferSelect
export type LabValueRow = typeof petLabValues.$inferSelect

const assertKeysOwned = (ownerId: string, keys: readonly string[]) => {
  if (keys.some((key) => !key.startsWith(`${ownerId}/`)))
    throw new ForbiddenError('PHOTO_NOT_OWNED')
}

export const addLabResult = async (
  context: PetsServiceContext,
  petId: string | null,
  input: unknown,
) => {
  const pet = await requirePet(context, petId)
  const { values, photoKeys, ...result } = parseOrThrow(labResultInputSchema, input)
  assertKeysOwned(context.ownerId, photoKeys)
  return context.db.transaction(async (tx) => {
    const [row] = await tx
      .insert(petLabResults)
      .values({ ...result, ownerId: context.ownerId, petId: pet.id })
      .returning()
    if (!row) throw new Error('Failed to insert lab result')
    if (values.length > 0) {
      await tx.insert(petLabValues).values(
        values.map((value, position) => ({
          ...value,
          position,
          ownerId: context.ownerId,
          labResultId: row.id,
        })),
      )
    }
    await addAttachments(tx, {
      ownerId: context.ownerId,
      entityType: LAB_RESULT_ENTITY_TYPE,
      entityId: row.id,
      storageKeys: photoKeys,
    })
    await recordTimelineEvent(tx, {
      ownerId: context.ownerId,
      entityType: PET_ENTITY_TYPE,
      entityId: pet.id,
      kind: LAB_RESULT_EVENT_KIND,
      occurredOn: row.takenOn,
      body: row.title,
      data: { labResultId: row.id },
    })
    return row
  })
}

export const listLabResults = (context: PetsServiceContext, petId: string, limit = DEFAULT_LIMIT) =>
  context.db
    .select()
    .from(petLabResults)
    .where(
      and(
        eq(petLabResults.ownerId, context.ownerId),
        eq(petLabResults.petId, petId),
        notDeleted(petLabResults),
      ),
    )
    .orderBy(desc(petLabResults.takenOn), desc(petLabResults.id))
    .limit(limit)

export const findLabResult = async (
  context: PetsServiceContext,
  id: string | null,
  petId?: string,
) => {
  if (!id) return null
  const [row] = await context.db
    .select()
    .from(petLabResults)
    .where(
      and(
        eq(petLabResults.ownerId, context.ownerId),
        eq(petLabResults.id, id),
        petId ? eq(petLabResults.petId, petId) : undefined,
        notDeleted(petLabResults),
      ),
    )
  return row ?? null
}

export const deleteLabResult = async (context: PetsServiceContext, id: string | null) => {
  const row = await findLabResult(context, id)
  if (!row) throw new NotFoundError('LAB_RESULT_NOT_FOUND')
  await context.db
    .update(petLabResults)
    .set({ deletedAt: new Date() })
    .where(eq(petLabResults.id, row.id))
  await removeAttachmentsFor(context.db, {
    ownerId: context.ownerId,
    entityType: LAB_RESULT_ENTITY_TYPE,
    entityId: row.id,
  })
  return requirePet(context, row.petId)
}

export const loadLabValues = async (context: PetsServiceContext, resultIds: readonly string[]) => {
  const rows = await context.db
    .select()
    .from(petLabValues)
    .where(
      and(
        eq(petLabValues.ownerId, context.ownerId),
        inArray(petLabValues.labResultId, [...resultIds]),
      ),
    )
    .orderBy(asc(petLabValues.position))
  return resultIds.map((id) => rows.filter((row) => row.labResultId === id))
}

export const loadLabPhotos = async (context: PetsServiceContext, resultIds: readonly string[]) => {
  const byResult = await listAttachments(context.db, {
    ownerId: context.ownerId,
    entityType: LAB_RESULT_ENTITY_TYPE,
    entityIds: resultIds,
  })
  return resultIds.map((id) => byResult.get(id) ?? [])
}
