import { useQuery } from '@apollo/client/react'
import { ListItem, Text } from '@brain/ui'
import { router } from 'expo-router'
import { Section } from '../../../components/section'
import { PetLabResultsQuery } from '../../../graphql/health'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { LabStatusBadge } from './lab-status-badge'

const LATEST_COUNT = 2

export const LabResultsSection = ({ petId }: { petId: string }) => {
  const labels = usePetLabels()
  const { t } = labels
  const { data } = useQuery(PetLabResultsQuery, { variables: { id: petId, first: LATEST_COUNT } })
  const results = data?.pet?.labResults ?? []

  return (
    <Section
      title={t('labs.title')}
      actions={[
        { label: t('labs.add'), onPress: () => router.push(`/pets/${petId}/labs/new`) },
        ...(results.length > 0
          ? [{ label: t('common.seeAll'), onPress: () => router.push(`/pets/${petId}/labs`) }]
          : []),
      ]}
    >
      {results.length === 0 ? (
        <Text tone="muted" className="py-2">
          {t('labs.empty')}
        </Text>
      ) : (
        results.map((result) => (
          <ListItem
            key={result.id}
            leading={<Text className="text-xl leading-normal">🧪</Text>}
            title={result.title}
            subtitle={labels.date(result.takenOn)}
            trailing={<LabStatusBadge abnormalCount={result.abnormalCount} />}
            onPress={() => router.push(`/pets/${petId}/labs/${result.id}`)}
          />
        ))
      )}
    </Section>
  )
}
