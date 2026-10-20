import { recordTimelineEvent } from '@brain/core/server'
import { kgToGrams, petWeightInputSchema } from '../../../shared/validation'
import { type PetsServiceContext, parseOrThrow } from '../../lib/context'
import { requirePet } from '../profile/profile.service'
import { insertWeightLog } from './weight.repository'

export const PET_ENTITY_TYPE = 'pets.pet'
export const WEIGHT_EVENT_KIND = 'pets.weight'

/** Stores the weight and mirrors it into the pet's timeline, atomically. */
export const logPetWeight = async (
  context: PetsServiceContext,
  petId: string | null,
  input: unknown,
) => {
  const pet = await requirePet(context, petId)
  const { weightKg, measuredOn, note } = parseOrThrow(petWeightInputSchema, input)
  const weightGrams = kgToGrams(weightKg)
  await context.db.transaction(async (tx) => {
    const log = await insertWeightLog(tx, {
      ownerId: context.ownerId,
      petId: pet.id,
      weightGrams,
      measuredOn,
      note,
    })
    await recordTimelineEvent(tx, {
      ownerId: context.ownerId,
      entityType: PET_ENTITY_TYPE,
      entityId: pet.id,
      kind: WEIGHT_EVENT_KIND,
      occurredOn: measuredOn,
      body: note ?? null,
      data: { weightLogId: log.id, weightGrams },
    })
  })
  return pet
}
