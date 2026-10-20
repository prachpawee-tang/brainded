import { type Builder, NotFoundError, UnauthenticatedError, ValidationError } from '@brain/graphql'
import { asUuid, petIdFromGlobalId, toServiceContext } from '../../lib/context'
import type { PetRef } from '../profile/profile.schema'
import {
  addMedication,
  type DoseView,
  dosesOn,
  listMedications,
  type MedicationRow,
  setDoseTaken,
  updateMedication,
} from './medications.service'

export const registerMedications = (builder: Builder, Pet: PetRef) => {
  const PetMedication = builder.objectRef<MedicationRow>('PetMedication').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      name: t.exposeString('name'),
      dosage: t.exposeString('dosage', { nullable: true }),
      times: t.exposeStringList('times'),
      everyDays: t.exposeInt('everyDays'),
      startOn: t.field({ type: 'LocalDate', resolve: (m) => m.startOn }),
      endOn: t.field({ type: 'LocalDate', nullable: true, resolve: (m) => m.endOn }),
      note: t.exposeString('note', { nullable: true }),
    }),
  })

  const PetDose = builder.objectRef<DoseView>('PetDose').implement({
    fields: (t) => ({
      id: t.id({ resolve: (d) => `${d.medication.id}:${d.date}:${d.time}` }),
      medication: t.field({ type: PetMedication, resolve: (d) => d.medication }),
      date: t.field({ type: 'LocalDate', resolve: (d) => d.date }),
      time: t.exposeString('time'),
      takenAt: t.field({ type: 'DateTime', nullable: true, resolve: (d) => d.takenAt }),
    }),
  })

  builder.objectFields(Pet, (t) => ({
    medications: t.field({
      type: [PetMedication],
      resolve: (pet, _args, context) => listMedications(toServiceContext(context), pet.id),
    }),
    dosesOn: t.field({
      type: [PetDose],
      args: { date: t.arg({ type: 'LocalDate', required: true }) },
      resolve: (pet, { date }, context) => dosesOn(toServiceContext(context), pet.id, date),
    }),
  }))

  const medicationFields = (
    t: Parameters<Parameters<typeof builder.inputType>[1]['fields']>[0],
  ) => ({
    name: t.string({ required: true }),
    dosage: t.string(),
    times: t.stringList({ required: true }),
    everyDays: t.int({ required: true }),
    startOn: t.field({ type: 'LocalDate', required: true }),
    endOn: t.field({ type: 'LocalDate' }),
    note: t.string(),
  })

  const AddPetMedicationInput = builder.inputType('AddPetMedicationInput', {
    fields: (t) => ({ petId: t.id({ required: true }), ...medicationFields(t) }),
  })
  const UpdatePetMedicationInput = builder.inputType('UpdatePetMedicationInput', {
    fields: (t) => ({ id: t.id({ required: true }), ...medicationFields(t) }),
  })
  const SetDoseTakenInput = builder.inputType('SetDoseTakenInput', {
    fields: (t) => ({
      medicationId: t.id({ required: true }),
      date: t.field({ type: 'LocalDate', required: true }),
      time: t.string({ required: true }),
      taken: t.boolean({ required: true }),
    }),
  })

  const errors = { types: [UnauthenticatedError, ValidationError, NotFoundError] }

  builder.mutationField('addPetMedication', (t) =>
    t.field({
      type: PetMedication,
      errors,
      args: { input: t.arg({ type: AddPetMedicationInput, required: true }) },
      resolve: (_root, { input: { petId, ...medication } }, context) =>
        addMedication(toServiceContext(context), petIdFromGlobalId(String(petId)), medication),
    }),
  )

  builder.mutationField('updatePetMedication', (t) =>
    t.field({
      type: PetMedication,
      errors,
      args: { input: t.arg({ type: UpdatePetMedicationInput, required: true }) },
      resolve: (_root, { input: { id, ...medication } }, context) =>
        updateMedication(toServiceContext(context), asUuid(id), medication),
    }),
  )

  builder.mutationField('setDoseTaken', (t) =>
    t.field({
      type: PetDose,
      errors: { types: [UnauthenticatedError, NotFoundError] },
      args: { input: t.arg({ type: SetDoseTakenInput, required: true }) },
      resolve: (_root, { input: { medicationId, ...dose } }, context) =>
        setDoseTaken(toServiceContext(context), asUuid(medicationId), dose),
    }),
  )
}
