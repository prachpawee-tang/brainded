import { isDoseDay } from './health'

// Pure planner: pet data → reminder candidates for the next few days, in device-local time.
// Translation and delivery happen elsewhere (app hook + shell scheduler).

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const DEFAULT_DAYS = 7
/** iOS keeps ~64 pending local notifications per app; leave headroom for other modules. */
const DEFAULT_LIMIT = 60
const TASK_REMINDER_HOUR = 9
const APPOINTMENT_LEADS = [
  { key: '1d', ms: DAY_MS },
  { key: '2h', ms: 2 * HOUR_MS },
] as const

export type ReminderKind = 'DOSE' | 'APPOINTMENT' | 'TASK'

export type PlannedReminder = {
  id: string
  kind: ReminderKind
  at: Date
  petId: string
  petName: string
  /** Medication name, appointment reason or to-do title. */
  subject: string
  /** Dosage, clinic, or lead time key — context for the body. */
  detail: string | null
}

type MedicationLike = {
  id: string
  name: string
  dosage?: string | null
  times: readonly string[]
  everyDays: number
  startOn: string
  endOn?: string | null
}
type AppointmentLike = {
  id: string
  reason: string
  scheduledAt: string
  status: string
  clinic?: string | null
}
type TaskLike = { id: string; title: string; dueOn?: string | null; completedAt?: string | null }

export type PetReminderSource = {
  id: string
  name: string
  medications: readonly MedicationLike[]
  appointments: readonly AppointmentLike[]
  tasks: readonly TaskLike[]
}

const pad = (n: number) => String(n).padStart(2, '0')
const isoDay = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const localAt = (day: string, hours: number, minutes = 0) => {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, hours, minutes)
}

export const planPetReminders = ({
  pets,
  now,
  kinds,
  days = DEFAULT_DAYS,
  limit = DEFAULT_LIMIT,
}: {
  pets: readonly PetReminderSource[]
  now: Date
  kinds: { doses: boolean; appointments: boolean; tasks: boolean }
  days?: number
  limit?: number
}): PlannedReminder[] => {
  const end = now.getTime() + days * DAY_MS
  const inWindow = (date: Date) => date.getTime() > now.getTime() && date.getTime() <= end
  const dayList = Array.from({ length: days + 1 }, (_, i) =>
    isoDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)),
  )
  const items: PlannedReminder[] = []

  for (const pet of pets) {
    const base = { petId: pet.id, petName: pet.name }

    if (kinds.doses) {
      for (const medication of pet.medications) {
        for (const day of dayList) {
          if (!isDoseDay(medication, day)) continue
          for (const time of medication.times) {
            const [hours, minutes] = time.split(':').map(Number)
            const at = localAt(day, hours ?? 0, minutes ?? 0)
            if (inWindow(at)) {
              items.push({
                ...base,
                id: `pets.dose:${medication.id}:${day}:${time}`,
                kind: 'DOSE',
                at,
                subject: medication.name,
                detail: medication.dosage ?? null,
              })
            }
          }
        }
      }
    }

    if (kinds.appointments) {
      for (const appointment of pet.appointments) {
        if (appointment.status !== 'SCHEDULED') continue
        const scheduled = Date.parse(appointment.scheduledAt)
        for (const lead of APPOINTMENT_LEADS) {
          const at = new Date(scheduled - lead.ms)
          if (inWindow(at)) {
            items.push({
              ...base,
              id: `pets.appointment:${appointment.id}:${lead.key}`,
              kind: 'APPOINTMENT',
              at,
              subject: appointment.reason,
              detail: lead.key,
            })
          }
        }
      }
    }

    if (kinds.tasks) {
      for (const task of pet.tasks) {
        if (task.completedAt || !task.dueOn) continue
        const at = localAt(task.dueOn, TASK_REMINDER_HOUR)
        if (inWindow(at))
          items.push({
            ...base,
            id: `pets.task:${task.id}`,
            kind: 'TASK',
            at,
            subject: task.title,
            detail: null,
          })
      }
    }
  }

  return items.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, limit)
}
