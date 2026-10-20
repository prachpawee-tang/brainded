import { recordTimelineEvent } from '@brain/core/server'
import { and, desc, eq, inArray, notDeleted } from '@brain/db'
import { NotFoundError } from '@brain/graphql'
import { isDoseDay, medicationInputSchema } from '../../../shared/health'
import { petMedicationDoses, petMedications } from '../../db/schema'
import { type PetsServiceContext, parseOrThrow } from '../../lib/context'
import { requirePet } from '../profile/profile.service'
import { PET_ENTITY_TYPE } from '../weight/weight.service'

export type MedicationRow = typeof petMedications.$inferSelect
export type DoseView = {
  medication: MedicationRow
  time: string
  date: string
  takenAt: Date | null
}

const MEDICATION_STARTED_KIND = 'pets.medication.started'

const findMedication = async (context: PetsServiceContext, id: string | null) => {
  if (!id) return null
  const [row] = await context.db
    .select()
    .from(petMedications)
    .where(
      and(
        eq(petMedications.ownerId, context.ownerId),
        eq(petMedications.id, id),
        notDeleted(petMedications),
      ),
    )
  return row ?? null
}

const requireMedication = async (context: PetsServiceContext, id: string | null) => {
  const row = await findMedication(context, id)
  if (!row) throw new NotFoundError('MEDICATION_NOT_FOUND')
  return row
}

export const addMedication = async (
  context: PetsServiceContext,
  petId: string | null,
  input: unknown,
) => {
  const pet = await requirePet(context, petId)
  const medication = parseOrThrow(medicationInputSchema, input)
  return context.db.transaction(async (tx) => {
    const [row] = await tx
      .insert(petMedications)
      .values({ ...medication, ownerId: context.ownerId, petId: pet.id })
      .returning()
    if (!row) throw new Error('Failed to insert medication')
    await recordTimelineEvent(tx, {
      ownerId: context.ownerId,
      entityType: PET_ENTITY_TYPE,
      entityId: pet.id,
      kind: MEDICATION_STARTED_KIND,
      occurredOn: row.startOn,
      body: [row.name, row.dosage].filter(Boolean).join(' · '),
      data: { medicationId: row.id },
    })
    return row
  })
}

export const updateMedication = async (
  context: PetsServiceContext,
  id: string | null,
  input: unknown,
) => {
  const existing = await requireMedication(context, id)
  const medication = parseOrThrow(medicationInputSchema, input)
  const [row] = await context.db
    .update(petMedications)
    .set(medication)
    .where(eq(petMedications.id, existing.id))
    .returning()
  if (!row) throw new Error('Failed to update medication')
  return row
}

export const listMedications = (context: PetsServiceContext, petId: string) =>
  context.db
    .select()
    .from(petMedications)
    .where(
      and(
        eq(petMedications.ownerId, context.ownerId),
        eq(petMedications.petId, petId),
        notDeleted(petMedications),
      ),
    )
    .orderBy(desc(petMedications.startOn), desc(petMedications.id))

/** Every scheduled dose of the pet on a calendar day, sorted by time, with taken state. */
export const dosesOn = async (
  context: PetsServiceContext,
  petId: string,
  date: string,
): Promise<DoseView[]> => {
  const medications = (await listMedications(context, petId)).filter((m) => isDoseDay(m, date))
  if (medications.length === 0) return []
  const taken = await context.db
    .select()
    .from(petMedicationDoses)
    .where(
      and(
        eq(petMedicationDoses.ownerId, context.ownerId),
        eq(petMedicationDoses.scheduledOn, date),
        inArray(
          petMedicationDoses.medicationId,
          medications.map((m) => m.id),
        ),
      ),
    )
  const takenAt = (medicationId: string, time: string) =>
    taken.find((d) => d.medicationId === medicationId && d.scheduledTime === time)?.takenAt ?? null
  return medications
    .flatMap((medication) =>
      medication.times.map((time) => ({
        medication,
        time,
        date,
        takenAt: takenAt(medication.id, time),
      })),
    )
    .sort(
      (a, b) => a.time.localeCompare(b.time) || a.medication.name.localeCompare(b.medication.name),
    )
}

export const setDoseTaken = async (
  context: PetsServiceContext,
  medicationId: string | null,
  { date, time, taken }: { date: string; time: string; taken: boolean },
): Promise<DoseView> => {
  const medication = await requireMedication(context, medicationId)
  if (!isDoseDay(medication, date) || !medication.times.includes(time))
    throw new NotFoundError('DOSE_NOT_SCHEDULED')
  const slot = and(
    eq(petMedicationDoses.medicationId, medication.id),
    eq(petMedicationDoses.scheduledOn, date),
    eq(petMedicationDoses.scheduledTime, time),
  )
  if (!taken) {
    await context.db.delete(petMedicationDoses).where(slot)
    return { medication, date, time, takenAt: null }
  }
  const [dose] = await context.db
    .insert(petMedicationDoses)
    .values({
      ownerId: context.ownerId,
      medicationId: medication.id,
      scheduledOn: date,
      scheduledTime: time,
    })
    .onConflictDoNothing()
    .returning()
  const takenAt =
    dose?.takenAt ??
    (await context.db.select().from(petMedicationDoses).where(slot))[0]?.takenAt ??
    new Date()
  return { medication, date, time, takenAt }
}
