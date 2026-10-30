import { useMutation, useQuery } from '@apollo/client/react'
import { Badge, EmptyState, HeaderBar, Icon, ScreenLayout, Skeleton, Text } from '@brain/ui'
import { router, useLocalSearchParams } from 'expo-router'
import { ChevronRight, Pencil, Trash2 } from 'lucide-react-native'
import { Image, Pressable, View } from 'react-native'
import { DeletePetLabResultMutation, PetLabResultQuery } from '../../../graphql/health'
import { confirmAction } from '../../../lib/confirm'
import { goBack } from '../../../lib/navigation'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { LabStatusBadge } from '../components/lab-status-badge'
import { FLAG_TONE, useLabDisplay } from '../lib/lab-display'
import { groupBySection } from '../lib/lab-form'

export const LabResultScreen = () => {
  const { id, labId } = useLocalSearchParams<{ id: string; labId: string }>()
  const labels = usePetLabels()
  const { t } = labels
  const display = useLabDisplay()
  const { data, loading } = useQuery(PetLabResultQuery, { variables: { id, labId } })
  const [deleteResult] = useMutation(DeletePetLabResultMutation, {
    refetchQueries: ['PetLabResults', 'PetTimeline'],
  })
  const result = data?.pet?.labResult

  const remove = async () => {
    if (!result) return
    const isConfirmed = await confirmAction(t('labs.deleteConfirm'), {
      confirm: t('common.delete'),
      cancel: t('common.cancel'),
    })
    if (!isConfirmed) return
    await deleteResult({ variables: { input: { id: result.id } } })
    goBack(`/pets/${id}/labs`)
  }

  if (loading && !data) {
    return (
      <ScreenLayout>
        <Skeleton className="h-64 rounded-xl" />
      </ScreenLayout>
    )
  }

  if (!result) {
    return (
      <ScreenLayout centered>
        <EmptyState
          glyph="🔍"
          message={t('errors.LAB_RESULT_NOT_FOUND')}
          action={{ label: t('common.back'), onPress: () => goBack(`/pets/${id}/labs`) }}
        />
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      <HeaderBar
        backLabel={t('common.back')}
        onBack={() => goBack(`/pets/${id}/labs`)}
        actions={[
          {
            label: t('common.edit'),
            icon: Pencil,
            onPress: () => router.push(`/pets/${id}/labs/${result.id}/edit`),
          },
          { label: t('common.delete'), icon: Trash2, onPress: remove },
        ]}
      />
      <View className="gap-2">
        <Text variant="title">{result.title}</Text>
        <Text tone="muted">
          {[labels.date(result.takenOn), result.clinic].filter(Boolean).join(' · ')}
        </Text>
        <LabStatusBadge abnormalCount={result.abnormalCount} />
      </View>

      {groupBySection(result.values).map((group) => (
        <View key={group.section} className="gap-2">
          <Text variant="caption" tone="muted" className="font-sans-medium">
            {t(`labs.sections.${group.section}`)}
          </Text>
          <View className="rounded-xl border border-border bg-surface px-4">
            {group.items.map(({ item: value }, index) => (
              <Pressable
                key={value.id}
                accessibilityRole="button"
                accessibilityLabel={`${value.name} ${display.result(value)}, ${display.flagLabel(value.flag)}`}
                accessibilityHint={t('labs.openTrend', { name: value.name })}
                onPress={() =>
                  router.push(`/pets/${id}/labs/tests/${encodeURIComponent(value.code)}`)
                }
                className={`py-3 active:opacity-70 ${index > 0 ? 'border-t border-border' : ''}`}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-0.5">
                    <Text className="font-sans-medium">{value.name}</Text>
                    {display.range(value) ? (
                      <Text variant="caption" tone="muted">
                        {display.range(value)}
                      </Text>
                    ) : null}
                  </View>
                  <View className="items-end gap-1">
                    <Text className="font-sans-bold">{display.result(value)}</Text>
                    <Badge tone={FLAG_TONE[value.flag]} label={display.flagLabel(value.flag)} />
                  </View>
                  <Icon icon={ChevronRight} tone="muted" />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {[
        ['interpretation', result.interpretation],
        ['remark', result.remark],
      ].map(([key, text]) =>
        text ? (
          <View key={key} className="gap-1">
            <Text variant="caption" tone="muted" className="font-sans-medium">
              {t(`labs.${key}Title`)}
            </Text>
            <Text>{text}</Text>
          </View>
        ) : null,
      )}

      {result.photos.length > 0 ? (
        <View className="gap-2">
          <Text variant="heading">{t('labs.photos')}</Text>
          <View className="flex-row flex-wrap gap-3">
            {result.photos.map((photo, index) => (
              <Image
                key={photo.id}
                accessibilityLabel={t('labs.photo', { index: index + 1 })}
                source={{ uri: photo.url }}
                className="size-32 rounded-lg bg-surface-muted"
              />
            ))}
          </View>
        </View>
      ) : null}

      {result.note ? (
        <View className="gap-1">
          <Text variant="caption" tone="muted" className="font-sans-medium">
            {t('labs.note')}
          </Text>
          <Text>{result.note}</Text>
        </View>
      ) : null}
    </ScreenLayout>
  )
}
