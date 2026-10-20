import { useQuery } from '@apollo/client/react'
import { Button, Skeleton, Text } from '@brain/ui'
import { View } from 'react-native'
import type { PetTimelineKind } from '../../../graphql/generated/graphql'
import { PetTimelineQuery } from '../../../graphql/pets'
import { formatMonth, formatWeightKg, groupByMonth } from '../../../lib/format'
import { usePetLabels } from '../../../lib/use-pet-labels'

const KIND_EMOJI: Record<PetTimelineKind, string> = {
  WEIGHT: '⚖️',
  NOTE_GENERAL: '📝',
  NOTE_VET_VISIT: '🩺',
  NOTE_VACCINE: '💉',
  NOTE_GROOMING: '✂️',
}

export const PetTimeline = ({ petId }: { petId: string }) => {
  const { t, language, date } = usePetLabels()
  const { data, loading, fetchMore } = useQuery(PetTimelineQuery, { variables: { id: petId } })
  const connection = data?.pet?.timeline
  const events = connection?.edges.map((edge) => edge.node) ?? []

  const loadMore = () =>
    fetchMore({
      variables: { after: connection?.pageInfo.endCursor },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!previous.pet || !fetchMoreResult?.pet) return previous
        return {
          ...previous,
          pet: {
            ...previous.pet,
            timeline: {
              ...fetchMoreResult.pet.timeline,
              edges: [...previous.pet.timeline.edges, ...fetchMoreResult.pet.timeline.edges],
            },
          },
        }
      },
    })

  if (loading && !data) return <Skeleton className="h-24 rounded-xl" />
  if (events.length === 0) return <Text tone="muted">{t('profile.timelineEmpty')}</Text>

  return (
    <View className="gap-6">
      {groupByMonth(events).map((group) => (
        <View key={group.month} className="gap-3">
          <Text variant="caption" tone="muted" className="font-sans-medium">
            {formatMonth(group.month, language)}
          </Text>
          {group.items.map((event) => (
            <View key={event.id} className="flex-row gap-3">
              <View className="size-10 items-center justify-center rounded-lg bg-surface-muted">
                <Text className="leading-normal">{KIND_EMOJI[event.kind]}</Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="font-sans-medium">
                  {t(`timeline.${event.kind}`, {
                    value: event.weightGrams ? formatWeightKg(event.weightGrams, language) : '',
                  })}
                </Text>
                {event.body ? <Text tone="muted">{event.body}</Text> : null}
                <Text variant="caption" tone="muted">
                  {date(event.occurredOn)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
      {connection?.pageInfo.hasNextPage ? (
        <Button variant="ghost" label={t('profile.loadMore')} onPress={loadMore} />
      ) : null}
    </View>
  )
}
