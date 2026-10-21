import { Badge, ListItem, Text } from '@brain/ui'
import { usePetLabels } from '../../../lib/use-pet-labels'
import type { Appointment } from '../lib/types'

export const AppointmentRows = ({
  appointments,
  onPress,
  showStatus = false,
}: {
  appointments: readonly Appointment[]
  onPress: (appointment: Appointment) => void
  showStatus?: boolean
}) => {
  const labels = usePetLabels()
  const { t } = labels
  return (
    <>
      {appointments.map((appointment) => (
        <ListItem
          key={appointment.id}
          leading={<Text className="text-xl leading-normal">🩺</Text>}
          title={appointment.reason}
          subtitle={[labels.dateTime(appointment.scheduledAt), appointment.clinic]
            .filter(Boolean)
            .join(' · ')}
          trailing={
            showStatus ? (
              <Badge
                tone={appointment.status === 'DONE' ? 'success' : 'neutral'}
                label={t(`appointments.statuses.${appointment.status}`)}
              />
            ) : undefined
          }
          onPress={() => onPress(appointment)}
        />
      ))}
    </>
  )
}
