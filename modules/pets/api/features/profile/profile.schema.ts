import {
  type Builder,
  ForbiddenError,
  NotFoundError,
  requireViewer,
  UnauthenticatedError,
  ValidationError,
} from '@brain/graphql'
import { PET_SEXES, PET_SPECIES } from '../../../shared/validation'
import {
  decodeCursor,
  encodeCursor,
  pageSize,
  petIdFromGlobalId,
  toServiceContext,
} from '../../lib/context'
import { findPet, type PetRow } from './profile.repository'
import { archivePet, createPet, listPetsPage, updatePet } from './profile.service'

const PHOTO_URL_TTL_SECONDS = 3600

export const registerProfile = (builder: Builder) => {
  const PetSpecies = builder.enumType('PetSpecies', { values: PET_SPECIES })
  const PetSex = builder.enumType('PetSex', { values: PET_SEXES })

  const Pet = builder.node(builder.objectRef<PetRow>('Pet'), {
    id: { resolve: (pet) => pet.id },
    loadOne: (id, context) => (context.viewer ? findPet(context.db, context.viewer.id, id) : null),
    fields: (t) => ({
      name: t.exposeString('name'),
      species: t.field({ type: PetSpecies, resolve: (pet) => pet.species }),
      speciesOther: t.exposeString('speciesOther', { nullable: true }),
      breed: t.exposeString('breed', { nullable: true }),
      sex: t.field({ type: PetSex, resolve: (pet) => pet.sex }),
      birthDate: t.field({ type: 'LocalDate', nullable: true, resolve: (pet) => pet.birthDate }),
      notes: t.exposeString('notes', { nullable: true }),
      photoUrl: t.string({
        nullable: true,
        resolve: (pet, _args, { storage }) =>
          pet.photoKey ? storage.getUrl(pet.photoKey, PHOTO_URL_TTL_SECONDS) : null,
      }),
      createdAt: t.field({ type: 'DateTime', resolve: (pet) => pet.createdAt }),
    }),
  })

  builder.queryField('pets', (t) =>
    t.connection({
      type: Pet,
      resolve: async (_root, args, context) => {
        const service = toServiceContext(context)
        const cursor = decodeCursor(args.after, 2)
        const { rows, hasNextPage } = await listPetsPage(service, {
          limit: pageSize(args.first),
          after: cursor ? { createdAt: cursor[0] ?? '', id: cursor[1] ?? '' } : null,
        })
        const edges = rows.map((pet) => ({
          node: pet,
          cursor: encodeCursor([pet.createdAt.toISOString(), pet.id]),
        }))
        return {
          edges,
          pageInfo: {
            hasNextPage,
            hasPreviousPage: Boolean(cursor),
            startCursor: edges[0]?.cursor ?? null,
            endCursor: edges.at(-1)?.cursor ?? null,
          },
        }
      },
    }),
  )

  builder.queryField('pet', (t) =>
    t.field({
      type: Pet,
      nullable: true,
      args: { id: t.arg.id({ required: true }) },
      resolve: (_root, { id }, context) => {
        const petId = petIdFromGlobalId(String(id))
        return petId ? findPet(context.db, requireViewer(context).id, petId) : null
      },
    }),
  )

  const CreatePetInput = builder.inputType('CreatePetInput', {
    fields: (t) => ({
      name: t.string({ required: true }),
      species: t.field({ type: PetSpecies, required: true }),
      speciesOther: t.string(),
      breed: t.string(),
      sex: t.field({ type: PetSex }),
      birthDate: t.field({ type: 'LocalDate' }),
      photoKey: t.string(),
      notes: t.string(),
    }),
  })

  const UpdatePetInput = builder.inputType('UpdatePetInput', {
    fields: (t) => ({
      id: t.id({ required: true }),
      name: t.string(),
      species: t.field({ type: PetSpecies }),
      speciesOther: t.string(),
      breed: t.string(),
      sex: t.field({ type: PetSex }),
      birthDate: t.field({ type: 'LocalDate' }),
      photoKey: t.string(),
      notes: t.string(),
    }),
  })

  const ArchivePetInput = builder.inputType('ArchivePetInput', {
    fields: (t) => ({ id: t.id({ required: true }) }),
  })

  builder.mutationField('createPet', (t) =>
    t.field({
      type: Pet,
      errors: { types: [UnauthenticatedError, ValidationError, ForbiddenError] },
      args: { input: t.arg({ type: CreatePetInput, required: true }) },
      resolve: (_root, { input }, context) => createPet(toServiceContext(context), input),
    }),
  )

  builder.mutationField('updatePet', (t) =>
    t.field({
      type: Pet,
      errors: { types: [UnauthenticatedError, ValidationError, ForbiddenError, NotFoundError] },
      args: { input: t.arg({ type: UpdatePetInput, required: true }) },
      resolve: (_root, { input: { id, ...changes } }, context) =>
        updatePet(toServiceContext(context), petIdFromGlobalId(String(id)), changes),
    }),
  )

  builder.mutationField('archivePet', (t) =>
    t.field({
      type: Pet,
      errors: { types: [UnauthenticatedError, NotFoundError] },
      args: { input: t.arg({ type: ArchivePetInput, required: true }) },
      resolve: (_root, { input }, context) =>
        archivePet(toServiceContext(context), petIdFromGlobalId(String(input.id))),
    }),
  )

  return Pet
}

export type PetRef = ReturnType<typeof registerProfile>
