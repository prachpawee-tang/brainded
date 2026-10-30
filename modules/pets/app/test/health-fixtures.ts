import { toIsoDate } from '@brain/ui'
import {
  PetAppointmentsQuery,
  PetLabResultsQuery,
  PetMedicationsQuery,
  PetTodayQuery,
  PetWeightsQuery,
} from '../graphql/health'
import { PET_ID } from './fixtures'

export const TODAY = toIsoDate(new Date())

export const weightsMock = (since: string | null, weights: [number, string][]) => ({
  request: { query: PetWeightsQuery, variables: since ? { id: PET_ID, since } : { id: PET_ID } },
  result: {
    data: {
      pet: {
        __typename: 'Pet' as const,
        id: PET_ID,
        weights: weights.map(([weightGrams, measuredOn], i) => ({
          __typename: 'PetWeight' as const,
          id: `w${i}`,
          weightGrams,
          measuredOn,
        })),
      },
    },
  },
})

type Dose = {
  medicationId: string
  name: string
  time: string
  takenAt?: string | null
  dosage?: string | null
}

type TodayTask = { id: string; title: string; dueOn: string | null }

export const todayMock = (
  doses: Dose[],
  next: { reason: string; scheduledAt: string; clinic?: string | null } | null = null,
  tasks: TodayTask[] = [],
) => ({
  request: { query: PetTodayQuery, variables: { id: PET_ID, date: TODAY } },
  result: {
    data: {
      pet: {
        __typename: 'Pet' as const,
        id: PET_ID,
        dosesOn: doses.map((d) => ({
          __typename: 'PetDose' as const,
          id: `${d.medicationId}:${TODAY}:${d.time}`,
          time: d.time,
          takenAt: d.takenAt ?? null,
          medication: {
            __typename: 'PetMedication' as const,
            id: d.medicationId,
            name: d.name,
            dosage: d.dosage ?? null,
          },
        })),
        nextAppointment: next
          ? { __typename: 'PetAppointment' as const, id: 'a-next', clinic: null, ...next }
          : null,
        tasks: tasks.map((t) => ({ __typename: 'PetTask' as const, completedAt: null, ...t })),
      },
    },
  },
})

export const labsMock = (
  labs: { id: string; title: string; takenOn: string; abnormalCount: number }[],
  first?: number,
) => ({
  request: { query: PetLabResultsQuery, variables: first ? { id: PET_ID, first } : { id: PET_ID } },
  result: {
    data: {
      pet: {
        __typename: 'Pet' as const,
        id: PET_ID,
        labResults: labs.map((l) => ({ __typename: 'PetLabResult' as const, clinic: null, ...l })),
      },
    },
  },
})

export type MedFixture = {
  id: string
  name: string
  times: string[]
  everyDays?: number
  startOn?: string
  endOn?: string | null
  dosage?: string | null
}

export const medicationsMock = (meds: MedFixture[]) => ({
  request: { query: PetMedicationsQuery, variables: { id: PET_ID } },
  result: {
    data: {
      pet: {
        __typename: 'Pet' as const,
        id: PET_ID,
        medications: meds.map((m) => ({
          __typename: 'PetMedication' as const,
          dosage: null,
          everyDays: 1,
          startOn: '2026-10-01',
          endOn: null,
          note: null,
          ...m,
        })),
      },
    },
  },
})

export type AppointmentFixture = {
  id: string
  reason: string
  scheduledAt: string
  status?: 'SCHEDULED' | 'DONE' | 'CANCELLED'
  clinic?: string | null
}

export const appointmentsMock = (appointments: AppointmentFixture[]) => ({
  request: { query: PetAppointmentsQuery, variables: { id: PET_ID } },
  result: {
    data: {
      pet: {
        __typename: 'Pet' as const,
        id: PET_ID,
        appointments: appointments.map((a) => ({
          __typename: 'PetAppointment' as const,
          clinic: null,
          note: null,
          status: 'SCHEDULED' as const,
          ...a,
        })),
      },
    },
  },
})

export const inDays = (days: number, hour = 9) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 30, 0, 0)
  return date.toISOString()
}

export const daysFromToday = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}
