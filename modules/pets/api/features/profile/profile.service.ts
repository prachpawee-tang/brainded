import { ForbiddenError, NotFoundError } from '@brain/graphql'
import { petInputSchema } from '../../../shared/validation'
import type { PetsServiceContext } from '../../lib/context'
import { parseOrThrow } from '../../lib/context'
import { findPet, insertPet, listPets, type PetRow, updatePetRow } from './profile.repository'

export const PET_NOT_FOUND = 'PET_NOT_FOUND'

export const requirePet = async (
  { db, ownerId }: PetsServiceContext,
  id: string | null,
): Promise<PetRow> => {
  const pet = id ? await findPet(db, ownerId, id) : null
  if (!pet) throw new NotFoundError(PET_NOT_FOUND)
  return pet
}

/** Uploaded keys are `<ownerId>/...` — never let a user attach someone else's file. */
const assertPhotoOwned = (ownerId: string, photoKey: string | null | undefined) => {
  if (photoKey && !photoKey.startsWith(`${ownerId}/`)) throw new ForbiddenError('PHOTO_NOT_OWNED')
}

const toEditable = (pet: PetRow) => ({
  name: pet.name,
  species: pet.species,
  speciesOther: pet.speciesOther,
  breed: pet.breed,
  sex: pet.sex,
  birthDate: pet.birthDate,
  photoKey: pet.photoKey,
  notes: pet.notes,
})

/** Drops `undefined` so omitted GraphQL fields keep their value while explicit `null` clears it. */
const definedOnly = <T extends Record<string, unknown>>(input: T): Partial<T> =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<T>

export const createPet = async (context: PetsServiceContext, input: unknown): Promise<PetRow> => {
  const pet = parseOrThrow(petInputSchema, input)
  assertPhotoOwned(context.ownerId, pet.photoKey)
  return insertPet(context.db, { ...pet, ownerId: context.ownerId })
}

export const updatePet = async (
  context: PetsServiceContext,
  id: string | null,
  input: Record<string, unknown>,
): Promise<PetRow> => {
  const existing = await requirePet(context, id)
  const pet = parseOrThrow(petInputSchema, { ...toEditable(existing), ...definedOnly(input) })
  assertPhotoOwned(context.ownerId, pet.photoKey)
  return updatePetRow(context.db, context.ownerId, existing.id, pet)
}

export const archivePet = async (
  context: PetsServiceContext,
  id: string | null,
): Promise<PetRow> => {
  const existing = await requirePet(context, id)
  return updatePetRow(context.db, context.ownerId, existing.id, { deletedAt: new Date() })
}

export const listPetsPage = (context: PetsServiceContext, page: Parameters<typeof listPets>[2]) =>
  listPets(context.db, context.ownerId, page)
