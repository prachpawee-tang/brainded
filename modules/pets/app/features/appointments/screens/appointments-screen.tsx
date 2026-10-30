import { useQuery } from '@apollo/client/react'
import { Button, EmptyState, HeaderBar, ScreenLayout, Skeleton, Text } from '@brain/ui'
import { useLocalSearchParams } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { View } from 'react-native'
import { PetAppointmentsQuery } from '../../../graphql/health'
import { goBack } from '../../../lib/navigation'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { AppointmentRows } from '../components/appointment-rows'
import { AppointmentSheet } from '../components/appointment-sheet'
import { isUpcoming } from '../lib/types'
import { useAppointmentSheet } from '../lib/use-appointment-sheet'

export const AppointmentsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = usePetLabels()
  const { data, loading } = useQuery(PetAppointmentsQuery, { variables: { id } })
  const sheet = useAppointmentSheet()
  const all = data?.pet?.appointments ?? []
  const groups = [
    {
      key: 'upcoming',
      title: t('appointments.upcoming'),
      items: all.filter((a) => isUpcoming(a)),
      showStatus: false,
    },
    {
      key: 'past',
      title: t('appointments.past'),
      items: all.filter((a) => !isUpcoming(a)).reverse(),
      showStatus: true,
    },
  ].filter((group) => group.items.length > 0)

  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} onBack={() => goBack(`/pets/${id}`)} />
      <Text variant="display">{t('appointments.listTitle')}</Text>
      {loading && !data ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : groups.length === 0 ? (
        <EmptyState glyph="🩺" message={t('appointments.empty')} />
      ) : (
        groups.map((group) => (
          <View key={group.key} className="gap-2">
            <Text variant="caption" tone="muted" className="font-sans-medium">
              {group.title}
            </Text>
            <View className="rounded-xl border border-border bg-surface px-4">
              <AppointmentRows
                appointments={group.items}
                onPress={sheet.openEdit}
                showStatus={group.showStatus}
              />
            </View>
          </View>
        ))
      )}
      <Button icon={Plus} label={t('appointments.add')} onPress={sheet.openNew} />
      <AppointmentSheet
        petId={id}
        appointment={sheet.appointment}
        visible={sheet.visible}
        onClose={sheet.close}
      />
    </ScreenLayout>
  )
}
