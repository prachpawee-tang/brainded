import { useQuery } from '@apollo/client/react'
import { EmptyState, ListItem, ScreenLayout, Skeleton, Text } from '@brain/ui'
import { useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { HeaderBar } from '../../../components/header-bar'
import { PetWeightsQuery } from '../../../graphql/health'
import { usePetLabels } from '../../../lib/use-pet-labels'

/** The full weight log — the accessible table view behind the chart. */
export const WeightsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const labels = usePetLabels()
  const { t } = labels
  const { data, loading } = useQuery(PetWeightsQuery, { variables: { id } })
  const weights = [...(data?.pet?.weights ?? [])].reverse()

  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} />
      <Text variant="display">{t('weight.listTitle')}</Text>
      {loading && !data ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : weights.length === 0 ? (
        <EmptyState glyph="⚖️" message={t('overview.noWeight')} />
      ) : (
        <View className="rounded-xl border border-border bg-surface px-4">
          {weights.map((weight) => (
            <ListItem
              key={weight.id}
              title={labels.date(weight.measuredOn)}
              trailing={<Text className="font-sans-medium">{labels.kg(weight.weightGrams)}</Text>}
            />
          ))}
        </View>
      )}
    </ScreenLayout>
  )
}
