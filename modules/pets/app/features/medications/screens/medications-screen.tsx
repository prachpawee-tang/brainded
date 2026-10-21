import { useQuery } from '@apollo/client/react'
import { Button, EmptyState, ScreenLayout, Skeleton, Text, toIsoDate } from '@brain/ui'
import { useLocalSearchParams } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { View } from 'react-native'
import { isMedicationActive } from '../../../../shared/health'
import { HeaderBar } from '../../../components/header-bar'
import { PetMedicationsQuery } from '../../../graphql/health'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { MedicationRows } from '../components/medication-rows'
import { MedicationSheet } from '../components/medication-sheet'
import { useMedicationSheet } from '../lib/use-medication-sheet'

export const MedicationsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = usePetLabels()
  const { data, loading } = useQuery(PetMedicationsQuery, { variables: { id } })
  const sheet = useMedicationSheet()
  const today = toIsoDate(new Date())
  const all = data?.pet?.medications ?? []
  const groups = [
    {
      key: 'active',
      title: t('meds.active'),
      items: all.filter((m) => isMedicationActive(m, today)),
    },
    {
      key: 'ended',
      title: t('meds.ended'),
      items: all.filter((m) => !isMedicationActive(m, today)),
    },
  ].filter((group) => group.items.length > 0)

  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} fallbackHref={`/pets/${id}`} />
      <Text variant="display">{t('meds.listTitle')}</Text>
      {loading && !data ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : groups.length === 0 ? (
        <EmptyState glyph="💊" message={t('meds.empty')} />
      ) : (
        groups.map((group) => (
          <View key={group.key} className="gap-2">
            <Text variant="caption" tone="muted" className="font-sans-medium">
              {group.title}
            </Text>
            <View className="rounded-xl border border-border bg-surface px-4">
              <MedicationRows medications={group.items} onPress={sheet.openEdit} />
            </View>
          </View>
        ))
      )}
      <Button icon={Plus} label={t('meds.add')} onPress={sheet.openNew} />
      <MedicationSheet
        petId={id}
        medication={sheet.medication}
        visible={sheet.visible}
        onClose={sheet.close}
      />
    </ScreenLayout>
  )
}
