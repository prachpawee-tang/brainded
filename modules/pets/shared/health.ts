import { z } from 'zod'

// Phase 3a shared logic: vet results, medications, appointments, weight stats.
// Messages are error codes, translated by the app via `pets:validation.<CODE>`.

const DAY_MS = 24 * 60 * 60 * 1000
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const MAX_TIMES_PER_DAY = 6
const MAX_EVERY_DAYS = 90

const isoDate = z.iso.date('INVALID_DATE')
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, 'TOO_LONG')
    .transform((value) => value || null)
    .nullish()
const optionalNumber = z.number('INVALID').finite('INVALID').nullish()

// ── Vet results ──────────────────────────────────────────────────────────────

export const LAB_FLAGS = ['LOW', 'NORMAL', 'HIGH', 'UNKNOWN'] as const
export type LabFlag = (typeof LAB_FLAGS)[number]

export const labFlag = (
  value: number,
  refLow?: number | null,
  refHigh?: number | null,
): LabFlag => {
  if (refLow == null && refHigh == null) return 'UNKNOWN'
  if (refLow != null && value < refLow) return 'LOW'
  if (refHigh != null && value > refHigh) return 'HIGH'
  return 'NORMAL'
}

/** Common tests offered as one-tap suggestions; ranges vary by lab so none are prefilled. */
export const LAB_PRESETS = [
  { name: 'HCT', unit: '%' },
  { name: 'WBC', unit: '10³/µL' },
  { name: 'PLT', unit: '10³/µL' },
  { name: 'BUN', unit: 'mg/dL' },
  { name: 'CREA', unit: 'mg/dL' },
  { name: 'ALT', unit: 'U/L' },
  { name: 'ALP', unit: 'U/L' },
  { name: 'GLU', unit: 'mg/dL' },
] as const

export const labValueSchema = z
  .object({
    name: z.string().trim().min(1, 'REQUIRED').max(40, 'TOO_LONG'),
    value: z.number('INVALID').finite('INVALID'),
    unit: optionalText(20),
    refLow: optionalNumber,
    refHigh: optionalNumber,
  })
  .superRefine((value, ctx) => {
    if (value.refLow != null && value.refHigh != null && value.refLow > value.refHigh) {
      ctx.addIssue({ code: 'custom', path: ['refHigh'], message: 'RANGE_INVERTED' })
    }
  })

export const labResultInputSchema = z
  .object({
    takenOn: isoDate,
    title: z.string().trim().min(1, 'REQUIRED').max(80, 'TOO_LONG'),
    clinic: optionalText(80),
    note: optionalText(2000),
    values: z.array(labValueSchema).max(60, 'TOO_LONG'),
    photoKeys: z.array(z.string()).max(10, 'TOO_LONG').default([]),
  })
  .superRefine((result, ctx) => {
    if (result.values.length === 0 && result.photoKeys.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['values'], message: 'EMPTY_RESULT' })
    }
  })

export type LabResultInput = z.infer<typeof labResultInputSchema>

// ── Medications ──────────────────────────────────────────────────────────────

export const medicationInputSchema = z
  .object({
    name: z.string().trim().min(1, 'REQUIRED').max(80, 'TOO_LONG'),
    dosage: optionalText(80),
    times: z
      .array(z.string().regex(TIME_PATTERN, 'INVALID_TIME'))
      .min(1, 'REQUIRED')
      .max(MAX_TIMES_PER_DAY, 'TOO_LONG')
      .transform((times) => [...new Set(times)].sort()),
    everyDays: z
      .number('INVALID')
      .int('INVALID')
      .min(1, 'TOO_SMALL')
      .max(MAX_EVERY_DAYS, 'TOO_BIG'),
    startOn: isoDate,
    endOn: isoDate.nullish(),
    note: optionalText(1000),
  })
  .superRefine((medication, ctx) => {
    if (medication.endOn && medication.endOn < medication.startOn) {
      ctx.addIssue({ code: 'custom', path: ['endOn'], message: 'BEFORE_START' })
    }
  })

export type MedicationInput = z.infer<typeof medicationInputSchema>

const dayNumber = (isoDay: string) => Math.round(Date.parse(`${isoDay}T00:00:00Z`) / DAY_MS)

/** Is `date` a dosing day for this schedule (start + n × everyDays, within [start, end])? */
export const isDoseDay = (
  { startOn, endOn, everyDays }: { startOn: string; endOn?: string | null; everyDays: number },
  date: string,
): boolean => {
  if (date < startOn || (endOn && date > endOn)) return false
  return (dayNumber(date) - dayNumber(startOn)) % everyDays === 0
}

export const isMedicationActive = ({ endOn }: { endOn?: string | null }, today: string) =>
  !endOn || endOn >= today

// ── Appointments ─────────────────────────────────────────────────────────────

export const APPOINTMENT_STATUSES = ['SCHEDULED', 'DONE', 'CANCELLED'] as const

export const appointmentInputSchema = z.object({
  /** ISO date-time with offset, e.g. 2026-11-01T09:30:00+07:00 */
  scheduledAt: z.iso.datetime({ offset: true, message: 'INVALID_DATE' }),
  reason: z.string().trim().min(1, 'REQUIRED').max(120, 'TOO_LONG'),
  clinic: optionalText(80),
  note: optionalText(1000),
})

export type AppointmentInput = z.infer<typeof appointmentInputSchema>

// ── Weight ───────────────────────────────────────────────────────────────────

/** Stats over weights in chronological order (grams). */
export const weightStats = (grams: readonly number[]) => {
  const first = grams[0]
  const last = grams.at(-1)
  if (first === undefined || last === undefined) return null
  return {
    average: Math.round(grams.reduce((sum, g) => sum + g, 0) / grams.length),
    min: Math.min(...grams),
    max: Math.max(...grams),
    change: last - first,
  }
}

// ── To-dos ───────────────────────────────────────────────────────────────────

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, 'REQUIRED').max(120, 'TOO_LONG'),
  note: optionalText(1000),
  dueOn: isoDate.nullish(),
})

export type TaskInput = z.infer<typeof taskInputSchema>
