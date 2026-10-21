import { type Builder, NotFoundError, UnauthenticatedError, ValidationError } from '@brain/graphql'
import { APPOINTMENT_STATUSES } from '../../../shared/health'
import { asUuid, petIdFromGlobalId, toServiceContext } from '../../lib/context'
import type { PetRef } from '../profile/profile.schema'
import {
  type AppointmentRow,
  addAppointment,
  findNextAppointment,
  listAppointments,
  setAppointmentStatus,
  updateAppointment,
} from './appointments.service'

export const registerAppointments = (builder: Builder, Pet: PetRef) => {
  const Status = builder.enumType('PetAppointmentStatus', { values: APPOINTMENT_STATUSES })

  const PetAppointment = builder.objectRef<AppointmentRow>('PetAppointment').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      scheduledAt: t.field({ type: 'DateTime', resolve: (a) => a.scheduledAt }),
      reason: t.exposeString('reason'),
      clinic: t.exposeString('clinic', { nullable: true }),
      note: t.exposeString('note', { nullable: true }),
      status: t.field({ type: Status, resolve: (a) => a.status }),
    }),
  })

  builder.objectFields(Pet, (t) => ({
    appointments: t.field({
      type: [PetAppointment],
      resolve: (pet, _args, context) => listAppointments(toServiceContext(context), pet.id),
    }),
    nextAppointment: t.field({
      type: PetAppointment,
      nullable: true,
      resolve: (pet, _args, context) => findNextAppointment(toServiceContext(context), pet.id),
    }),
  }))

  // `scheduledAt` is an ISO string here (validated by the shared zod schema) so bad input
  // surfaces as a typed ValidationError instead of a GraphQL coercion error.
  const appointmentFields = (
    t: Parameters<Parameters<typeof builder.inputType>[1]['fields']>[0],
  ) => ({
    scheduledAt: t.string({ required: true }),
    reason: t.string({ required: true }),
    clinic: t.string(),
    note: t.string(),
  })

  const AddPetAppointmentInput = builder.inputType('AddPetAppointmentInput', {
    fields: (t) => ({ petId: t.id({ required: true }), ...appointmentFields(t) }),
  })
  const UpdatePetAppointmentInput = builder.inputType('UpdatePetAppointmentInput', {
    fields: (t) => ({ id: t.id({ required: true }), ...appointmentFields(t) }),
  })
  const SetPetAppointmentStatusInput = builder.inputType('SetPetAppointmentStatusInput', {
    fields: (t) => ({
      id: t.id({ required: true }),
      status: t.field({ type: Status, required: true }),
      /** Appointment day in the user's time zone, used for the timeline entry. */
      localDate: t.field({ type: 'LocalDate' }),
    }),
  })

  const errors = { types: [UnauthenticatedError, ValidationError, NotFoundError] }

  builder.mutationField('addPetAppointment', (t) =>
    t.field({
      type: PetAppointment,
      errors,
      args: { input: t.arg({ type: AddPetAppointmentInput, required: true }) },
      resolve: (_root, { input: { petId, ...appointment } }, context) =>
        addAppointment(toServiceContext(context), petIdFromGlobalId(String(petId)), appointment),
    }),
  )

  builder.mutationField('updatePetAppointment', (t) =>
    t.field({
      type: PetAppointment,
      errors,
      args: { input: t.arg({ type: UpdatePetAppointmentInput, required: true }) },
      resolve: (_root, { input: { id, ...appointment } }, context) =>
        updateAppointment(toServiceContext(context), asUuid(id), appointment),
    }),
  )

  builder.mutationField('setPetAppointmentStatus', (t) =>
    t.field({
      type: PetAppointment,
      errors: { types: [UnauthenticatedError, NotFoundError] },
      args: { input: t.arg({ type: SetPetAppointmentStatusInput, required: true }) },
      resolve: (_root, { input }, context) =>
        setAppointmentStatus(
          toServiceContext(context),
          asUuid(input.id),
          input.status,
          input.localDate,
        ),
    }),
  )
}
