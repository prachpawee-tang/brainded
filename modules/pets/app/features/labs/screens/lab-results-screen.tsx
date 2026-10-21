import { useQuery } from '@apollo/client/react'
import { Button, EmptyState, ListItem, ScreenLayout, Skeleton, Text } from '@brain/ui'
import { router, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { HeaderBar } from '../../../components/header-bar'
import { PetLabResultsQuery } from '../../../graphql/health'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { LabStatusBadge } from '../components/lab-status-badge'

export const LabResultsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const labels = usePetLabels()
  const { t } = labels
  const { data, loading } = useQuery(PetLabResultsQuery, { variables: { id } })
  const results = data?.pet?.labResults ?? []

  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} fallbackHref={`/pets/${id}`} />
      <Text variant="display">{t('labs.listTitle')}</Text>
      {loading && !data ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : results.length === 0 ? (
        <EmptyState glyph="🧪" message={t('labs.empty')} />
      ) : (
        <View className="rounded-xl border border-border bg-surface px-4">
          {results.map((result) => (
            <ListItem
              key={result.id}
              title={result.title}
              subtitle={[labels.date(result.takenOn), result.clinic].filter(Boolean).join(' · ')}
              trailing={<LabStatusBadge abnormalCount={result.abnormalCount} />}
              onPress={() => router.push(`/pets/${id}/labs/${result.id}`)}
            />
          ))}
        </View>
      )}
      <Button label={t('labs.add')} onPress={() => router.push(`/pets/${id}/labs/new`)} />
    </ScreenLayout>
  )
}
