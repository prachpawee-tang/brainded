import { ScreenLayout, Text } from '@brain/ui'
import { useLocalSearchParams } from 'expo-router'
import { HeaderBar } from '../../../components/header-bar'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { PetTimeline } from '../components/pet-timeline'

export const HistoryScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = usePetLabels()
  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} fallbackHref={`/pets/${id}`} />
      <Text variant="display">{t('profile.timeline')}</Text>
      <PetTimeline petId={id} />
    </ScreenLayout>
  )
}
