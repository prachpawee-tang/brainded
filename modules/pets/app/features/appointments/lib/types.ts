import type { PetAppointmentsQuery } from '../../../graphql/generated/graphql'

export type Appointment = NonNullable<PetAppointmentsQuery['pet']>['appointments'][number]

export const isUpcoming = (
  appointment: Pick<Appointment, 'status' | 'scheduledAt'>,
  now = Date.now(),
) => appointment.status === 'SCHEDULED' && Date.parse(appointment.scheduledAt) >= now
