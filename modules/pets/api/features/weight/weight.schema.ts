import { type Builder, NotFoundError, UnauthenticatedError, ValidationError } from '@brain/graphql'
import { petIdFromGlobalId, toServiceContext } from '../../lib/context'
import { contextLoader } from '../../lib/loaders'
import type { PetRef } from '../profile/profile.schema'
import { findRecentWeights, type WeightLogRow } from './weight.repository'
import { logPetWeight } from './weight.service'

export const registerWeight = (builder: Builder, Pet: PetRef) => {
  const PetWeight = builder.objectRef<WeightLogRow>('PetWeight').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      weightGrams: t.exposeInt('weightGrams'),
      measuredOn: t.field({ type: 'LocalDate', resolve: (log) => log.measuredOn }),
      note: t.exposeString('note', { nullable: true }),
    }),
  })

  const recentWeights = (
    pet: { id: string; ownerId: string },
    context: object & Parameters<typeof toServiceContext>[0],
  ) =>
    contextLoader<WeightLogRow[]>(context, 'pets.recentWeights', async (petIds) => {
      const byPet = await findRecentWeights(context.db, pet.ownerId, petIds)
      return petIds.map((id) => byPet.get(id) ?? [])
    }).load(pet.id)

  builder.objectFields(Pet, (t) => ({
    latestWeight: t.field({
      type: PetWeight,
      nullable: true,
      resolve: async (pet, _args, context) => (await recentWeights(pet, context))[0] ?? null,
    }),
    previousWeight: t.field({
      type: PetWeight,
      nullable: true,
      resolve: async (pet, _args, context) => (await recentWeights(pet, context))[1] ?? null,
    }),
  }))

  const LogPetWeightInput = builder.inputType('LogPetWeightInput', {
    fields: (t) => ({
      petId: t.id({ required: true }),
      weightKg: t.float({ required: true }),
      measuredOn: t.field({ type: 'LocalDate', required: true }),
      note: t.string(),
    }),
  })

  builder.mutationField('logPetWeight', (t) =>
    t.field({
      type: Pet,
      errors: { types: [UnauthenticatedError, ValidationError, NotFoundError] },
      args: { input: t.arg({ type: LogPetWeightInput, required: true }) },
      resolve: (_root, { input: { petId, ...weight } }, context) =>
        logPetWeight(toServiceContext(context), petIdFromGlobalId(String(petId)), weight),
    }),
  )
}
