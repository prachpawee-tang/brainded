import { recordTimelineEvent } from '@brain/core/server'
import { and, asc, eq, gte, notDeleted } from '@brain/db'
import { NotFoundError } from '@brain/graphql'
import { appointmentInputSchema } from '../../../shared/health'
import { petAppointments } from '../../db/schema'
import { type PetsServiceContext, parseOrThrow } from '../../lib/context'
import { requirePet } from '../profile/profile.service'
import { PET_ENTITY_TYPE } from '../weight/weight.service'

export type AppointmentRow = typeof petAppointments.$inferSelect
export type AppointmentStatus = AppointmentRow['status']

const APPOINTMENT_DONE_KIND = 'pets.appointment.done'

const requireAppointment = async (context: PetsServiceContext, id: string | null) => {
  const [row] = id
    ? await context.db
        .select()
        .from(petAppointments)
        .where(
          and(
            eq(petAppointments.ownerId, context.ownerId),
            eq(petAppointments.id, id),
            notDeleted(petAppointments),
          ),
        )
    : []
  if (!row) throw new NotFoundError('APPOINTMENT_NOT_FOUND')
  return row
}

const toValues = (input: unknown) => {
  const { scheduledAt, ...rest } = parseOrThrow(appointmentInputSchema, input)
  return { ...rest, scheduledAt: new Date(scheduledAt) }
}

export const addAppointment = async (
  context: PetsServiceContext,
  petId: string | null,
  input: unknown,
) => {
  const pet = await requirePet(context, petId)
  const [row] = await context.db
    .insert(petAppointments)
    .values({ ...toValues(input), ownerId: context.ownerId, petId: pet.id })
    .returning()
  if (!row) throw new Error('Failed to insert appointment')
  return row
}

export const updateAppointment = async (
  context: PetsServiceContext,
  id: string | null,
  input: unknown,
) => {
  const existing = await requireAppointment(context, id)
  const [row] = await context.db
    .update(petAppointments)
    .set(toValues(input))
    .where(eq(petAppointments.id, existing.id))
    .returning()
  if (!row) throw new Error('Failed to update appointment')
  return row
}

export const setAppointmentStatus = async (
  context: PetsServiceContext,
  id: string | null,
  status: AppointmentStatus,
) => {
  const existing = await requireAppointment(context, id)
  return context.db.transaction(async (tx) => {
    const [row] = await tx
      .update(petAppointments)
      .set({ status })
      .where(eq(petAppointments.id, existing.id))
      .returning()
    if (!row) throw new Error('Failed to update appointment')
    if (status === 'DONE' && existing.status !== 'DONE') {
      await recordTimelineEvent(tx, {
        ownerId: context.ownerId,
        entityType: PET_ENTITY_TYPE,
        entityId: row.petId,
        kind: APPOINTMENT_DONE_KIND,
        occurredOn: row.scheduledAt.toISOString().slice(0, 10),
        body: row.reason,
        data: { appointmentId: row.id },
      })
    }
    return row
  })
}

export const listAppointments = (context: PetsServiceContext, petId: string) =>
  context.db
    .select()
    .from(petAppointments)
    .where(
      and(
        eq(petAppointments.ownerId, context.ownerId),
        eq(petAppointments.petId, petId),
        notDeleted(petAppointments),
      ),
    )
    .orderBy(asc(petAppointments.scheduledAt))

export const findNextAppointment = async (
  context: PetsServiceContext,
  petId: string,
  now = new Date(),
) => {
  const [row] = await context.db
    .select()
    .from(petAppointments)
    .where(
      and(
        eq(petAppointments.ownerId, context.ownerId),
        eq(petAppointments.petId, petId),
        eq(petAppointments.status, 'SCHEDULED'),
        gte(petAppointments.scheduledAt, now),
        notDeleted(petAppointments),
      ),
    )
    .orderBy(asc(petAppointments.scheduledAt))
    .limit(1)
  return row ?? null
}
