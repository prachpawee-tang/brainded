import type { Attachment } from '@brain/core/server'
import {
  type Builder,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from '@brain/graphql'
import { LAB_FLAGS, labFlag } from '../../../shared/health'
import { asUuid, petIdFromGlobalId, toServiceContext } from '../../lib/context'
import { contextLoader } from '../../lib/loaders'
import type { PetRef } from '../profile/profile.schema'
import {
  addLabResult,
  deleteLabResult,
  findLabResult,
  type LabResultRow,
  type LabValueRow,
  listLabResults,
  loadLabPhotos,
  loadLabValues,
} from './labs.service'

const PHOTO_URL_TTL_SECONDS = 3600

export const registerLabs = (builder: Builder, Pet: PetRef) => {
  const LabFlag = builder.enumType('PetLabFlag', { values: LAB_FLAGS })

  const PetLabValue = builder.objectRef<LabValueRow>('PetLabValue').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      name: t.exposeString('name'),
      value: t.exposeFloat('value'),
      unit: t.exposeString('unit', { nullable: true }),
      refLow: t.exposeFloat('refLow', { nullable: true }),
      refHigh: t.exposeFloat('refHigh', { nullable: true }),
      flag: t.field({ type: LabFlag, resolve: (v) => labFlag(v.value, v.refLow, v.refHigh) }),
    }),
  })

  const PetAttachment = builder.objectRef<Attachment>('PetAttachment').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      url: t.string({
        resolve: (a, _args, { storage }) => storage.getUrl(a.storageKey, PHOTO_URL_TTL_SECONDS),
      }),
    }),
  })

  const values = (result: LabResultRow, context: Parameters<typeof toServiceContext>[0]) =>
    contextLoader<LabValueRow[]>(context, 'pets.labValues', (ids) =>
      loadLabValues(toServiceContext(context), ids),
    ).load(result.id)

  const PetLabResult = builder.objectRef<LabResultRow>('PetLabResult').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      takenOn: t.field({ type: 'LocalDate', resolve: (r) => r.takenOn }),
      title: t.exposeString('title'),
      clinic: t.exposeString('clinic', { nullable: true }),
      note: t.exposeString('note', { nullable: true }),
      values: t.field({ type: [PetLabValue], resolve: (r, _args, context) => values(r, context) }),
      abnormalCount: t.int({
        resolve: async (r, _args, context) =>
          (await values(r, context)).filter((v) =>
            ['LOW', 'HIGH'].includes(labFlag(v.value, v.refLow, v.refHigh)),
          ).length,
      }),
      photos: t.field({
        type: [PetAttachment],
        resolve: (r, _args, context) =>
          contextLoader<Attachment[]>(context, 'pets.labPhotos', (ids) =>
            loadLabPhotos(toServiceContext(context), ids),
          ).load(r.id),
      }),
    }),
  })

  builder.objectFields(Pet, (t) => ({
    labResults: t.field({
      type: [PetLabResult],
      args: { first: t.arg.int() },
      resolve: (pet, { first }, context) =>
        listLabResults(toServiceContext(context), pet.id, first ?? undefined),
    }),
    labResult: t.field({
      type: PetLabResult,
      nullable: true,
      args: { id: t.arg.id({ required: true }) },
      resolve: (pet, { id }, context) =>
        findLabResult(toServiceContext(context), asUuid(id), pet.id),
    }),
  }))

  const LabValueInput = builder.inputType('PetLabValueInput', {
    fields: (t) => ({
      name: t.string({ required: true }),
      value: t.float({ required: true }),
      unit: t.string(),
      refLow: t.float(),
      refHigh: t.float(),
    }),
  })

  const AddPetLabResultInput = builder.inputType('AddPetLabResultInput', {
    fields: (t) => ({
      petId: t.id({ required: true }),
      takenOn: t.field({ type: 'LocalDate', required: true }),
      title: t.string({ required: true }),
      clinic: t.string(),
      note: t.string(),
      values: t.field({ type: [LabValueInput], required: true }),
      photoKeys: t.stringList(),
    }),
  })

  builder.mutationField('addPetLabResult', (t) =>
    t.field({
      type: PetLabResult,
      errors: { types: [UnauthenticatedError, ValidationError, NotFoundError, ForbiddenError] },
      args: { input: t.arg({ type: AddPetLabResultInput, required: true }) },
      resolve: (_root, { input: { petId, ...result } }, context) =>
        addLabResult(toServiceContext(context), petIdFromGlobalId(String(petId)), {
          ...result,
          photoKeys: result.photoKeys ?? [],
        }),
    }),
  )

  const DeletePetLabResultInput = builder.inputType('DeletePetLabResultInput', {
    fields: (t) => ({ id: t.id({ required: true }) }),
  })

  builder.mutationField('deletePetLabResult', (t) =>
    t.field({
      type: Pet,
      errors: { types: [UnauthenticatedError, NotFoundError] },
      args: { input: t.arg({ type: DeletePetLabResultInput, required: true }) },
      resolve: (_root, { input }, context) =>
        deleteLabResult(toServiceContext(context), asUuid(input.id)),
    }),
  )
}
