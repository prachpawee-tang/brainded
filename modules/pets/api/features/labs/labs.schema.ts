import type { Attachment } from '@brain/core/server'
import {
  type Builder,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from '@brain/graphql'
import { LAB_FLAGS, LAB_SECTIONS } from '../../../shared/health'
import { labValueFlag } from '../../../shared/lab-catalog'
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
  listLabTrend,
  loadLabPhotos,
  loadLabValues,
  updateLabResult,
} from './labs.service'

const PHOTO_URL_TTL_SECONDS = 3600

export const registerLabs = (builder: Builder, Pet: PetRef) => {
  const LabFlag = builder.enumType('PetLabFlag', { values: LAB_FLAGS })
  const LabSection = builder.enumType('PetLabSection', { values: LAB_SECTIONS })
  const AbnormalFlags = new Set(['LOW', 'HIGH', 'ABNORMAL'])

  const PetLabValue = builder.objectRef<LabValueRow>('PetLabValue').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      section: t.field({
        type: LabSection,
        resolve: (v) => v.section as (typeof LAB_SECTIONS)[number],
      }),
      code: t.exposeString('code'),
      name: t.exposeString('name'),
      value: t.exposeFloat('value', { nullable: true }),
      textValue: t.exposeString('textValue', { nullable: true }),
      unit: t.exposeString('unit', { nullable: true }),
      refLow: t.exposeFloat('refLow', { nullable: true }),
      refHigh: t.exposeFloat('refHigh', { nullable: true }),
      flag: t.field({ type: LabFlag, resolve: (v) => labValueFlag(v) }),
    }),
  })

  const PetLabTrendPoint = builder
    .objectRef<{ value: LabValueRow; takenOn: string }>('PetLabTrendPoint')
    .implement({
      fields: (t) => ({
        id: t.id({ resolve: (p) => p.value.id }),
        takenOn: t.field({ type: 'LocalDate', resolve: (p) => p.takenOn }),
        labResultId: t.id({ resolve: (p) => p.value.labResultId }),
        name: t.string({ resolve: (p) => p.value.name }),
        value: t.float({ nullable: true, resolve: (p) => p.value.value }),
        textValue: t.string({ nullable: true, resolve: (p) => p.value.textValue }),
        unit: t.string({ nullable: true, resolve: (p) => p.value.unit }),
        refLow: t.float({ nullable: true, resolve: (p) => p.value.refLow }),
        refHigh: t.float({ nullable: true, resolve: (p) => p.value.refHigh }),
        flag: t.field({ type: LabFlag, resolve: (p) => labValueFlag(p.value) }),
      }),
    })

  const PetAttachment = builder.objectRef<Attachment>('PetAttachment').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      key: t.exposeString('storageKey'),
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
      remark: t.exposeString('remark', { nullable: true }),
      interpretation: t.exposeString('interpretation', { nullable: true }),
      values: t.field({ type: [PetLabValue], resolve: (r, _args, context) => values(r, context) }),
      abnormalCount: t.int({
        resolve: async (r, _args, context) =>
          (await values(r, context)).filter((v) => AbnormalFlags.has(labValueFlag(v))).length,
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
    labTrend: t.field({
      type: [PetLabTrendPoint],
      args: { code: t.arg.string({ required: true }) },
      resolve: (pet, { code }, context) => listLabTrend(toServiceContext(context), pet.id, code),
    }),
  }))

  const LabValueInput = builder.inputType('PetLabValueInput', {
    fields: (t) => ({
      section: t.field({ type: LabSection }),
      name: t.string({ required: true }),
      code: t.string(),
      value: t.float(),
      textValue: t.string(),
      unit: t.string(),
      refLow: t.float(),
      refHigh: t.float(),
    }),
  })

  const labResultFields = (
    t: Parameters<Parameters<typeof builder.inputType>[1]['fields']>[0],
  ) => ({
    takenOn: t.field({ type: 'LocalDate', required: true }),
    title: t.string({ required: true }),
    clinic: t.string(),
    note: t.string(),
    remark: t.string(),
    interpretation: t.string(),
    values: t.field({ type: [LabValueInput], required: true }),
    photoKeys: t.stringList(),
  })

  const AddPetLabResultInput = builder.inputType('AddPetLabResultInput', {
    fields: (t) => ({ petId: t.id({ required: true }), ...labResultFields(t) }),
  })

  const UpdatePetLabResultInput = builder.inputType('UpdatePetLabResultInput', {
    fields: (t) => ({ id: t.id({ required: true }), ...labResultFields(t) }),
  })

  builder.mutationField('updatePetLabResult', (t) =>
    t.field({
      type: PetLabResult,
      errors: { types: [UnauthenticatedError, ValidationError, NotFoundError, ForbiddenError] },
      args: { input: t.arg({ type: UpdatePetLabResultInput, required: true }) },
      resolve: (_root, { input: { id, ...result } }, context) =>
        updateLabResult(toServiceContext(context), asUuid(id), {
          ...result,
          photoKeys: result.photoKeys ?? [],
        }),
    }),
  )

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
