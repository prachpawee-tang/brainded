import { HeaderBar, ScreenLayout, Text } from '@brain/ui'
import { useLocalSearchParams } from 'expo-router'
import { goBack } from '../../../lib/navigation'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { PetTimeline } from '../components/pet-timeline'

export const HistoryScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = usePetLabels()
  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} onBack={() => goBack(`/pets/${id}`)} />
      <Text variant="display">{t('profile.timeline')}</Text>
      <PetTimeline petId={id} />
    </ScreenLayout>
  )
}
