import { useQuery } from '@apollo/client/react'
import { Text } from '@brain/ui'
import { router } from 'expo-router'
import { ChevronRight, Plus } from 'lucide-react-native'
import { Section } from '../../../components/section'
import { PetAppointmentsQuery } from '../../../graphql/health'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { isUpcoming } from '../lib/types'
import { useAppointmentSheet } from '../lib/use-appointment-sheet'
import { AppointmentRows } from './appointment-rows'
import { AppointmentSheet } from './appointment-sheet'

const MAX_UPCOMING = 3

export const AppointmentsSection = ({ petId }: { petId: string }) => {
  const { t } = usePetLabels()
  const { data } = useQuery(PetAppointmentsQuery, { variables: { id: petId } })
  const sheet = useAppointmentSheet()
  const all = data?.pet?.appointments ?? []
  const upcoming = all.filter((a) => isUpcoming(a)).slice(0, MAX_UPCOMING)

  return (
    <Section
      title={t('appointments.title')}
      actions={[
        { label: t('appointments.add'), icon: Plus, isPrimary: true, onPress: sheet.openNew },
        ...(all.length > 0
          ? [
              {
                label: t('common.seeAll'),
                icon: ChevronRight,
                onPress: () => router.push(`/pets/${petId}/appointments`),
              },
            ]
          : []),
      ]}
    >
      {upcoming.length === 0 ? (
        <Text tone="muted" className="py-2">
          {t('appointments.empty')}
        </Text>
      ) : (
        <AppointmentRows appointments={upcoming} onPress={sheet.openEdit} />
      )}
      <AppointmentSheet
        petId={petId}
        appointment={sheet.appointment}
        visible={sheet.visible}
        onClose={sheet.close}
      />
    </Section>
  )
}
