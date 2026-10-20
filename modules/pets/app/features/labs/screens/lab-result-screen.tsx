import { useMutation, useQuery } from '@apollo/client/react'
import { Badge, type BadgeTone, Button, EmptyState, ScreenLayout, Skeleton, Text } from '@brain/ui'
import { router, useLocalSearchParams } from 'expo-router'
import { Image, View } from 'react-native'
import { HeaderBar } from '../../../components/header-bar'
import type { PetLabFlag } from '../../../graphql/generated/graphql'
import { DeletePetLabResultMutation, PetLabResultQuery } from '../../../graphql/health'
import { confirmAction } from '../../../lib/confirm'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { LabStatusBadge } from '../components/lab-status-badge'

const FLAG_TONE: Record<PetLabFlag, BadgeTone> = {
  LOW: 'warning',
  HIGH: 'warning',
  NORMAL: 'success',
  UNKNOWN: 'neutral',
}
const FLAG_ICON: Record<PetLabFlag, string> = { LOW: '↓ ', HIGH: '↑ ', NORMAL: '', UNKNOWN: '' }

const formatNumber = (value: number, language: string) =>
  new Intl.NumberFormat(language.startsWith('th') ? 'th-TH' : 'en-GB', {
    maximumFractionDigits: 3,
  }).format(value)

export const LabResultScreen = () => {
  const { id, labId } = useLocalSearchParams<{ id: string; labId: string }>()
  const labels = usePetLabels()
  const { t, language } = labels
  const { data, loading } = useQuery(PetLabResultQuery, { variables: { id, labId } })
  const [deleteResult] = useMutation(DeletePetLabResultMutation, {
    refetchQueries: ['PetLabResults', 'PetTimeline'],
  })
  const result = data?.pet?.labResult

  const range = (low: number | null | undefined, high: number | null | undefined) => {
    if (low != null && high != null)
      return t('labs.range', {
        low: formatNumber(low, language),
        high: formatNumber(high, language),
      })
    if (low != null) return t('labs.rangeLow', { low: formatNumber(low, language) })
    if (high != null) return t('labs.rangeHigh', { high: formatNumber(high, language) })
    return null
  }

  const remove = async () => {
    if (!result) return
    const isConfirmed = await confirmAction(t('labs.deleteConfirm'), {
      confirm: t('common.delete'),
      cancel: t('common.cancel'),
    })
    if (!isConfirmed) return
    await deleteResult({ variables: { input: { id: result.id } } })
    router.back()
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
          action={{ label: t('common.back'), onPress: () => router.back() }}
        />
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} />
      <View className="gap-2">
        <Text variant="title">{result.title}</Text>
        <Text tone="muted">
          {[labels.date(result.takenOn), result.clinic].filter(Boolean).join(' · ')}
        </Text>
        <LabStatusBadge abnormalCount={result.abnormalCount} />
      </View>

      {result.values.length > 0 ? (
        <View className="rounded-xl border border-border bg-surface px-4">
          {result.values.map((value, index) => (
            <View key={value.id} className={index > 0 ? 'border-t border-border py-3' : 'py-3'}>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 gap-0.5">
                  <Text className="font-sans-medium">{value.name}</Text>
                  {range(value.refLow, value.refHigh) ? (
                    <Text variant="caption" tone="muted">
                      {range(value.refLow, value.refHigh)}
                    </Text>
                  ) : null}
                </View>
                <View className="items-end gap-1">
                  <Text className="font-sans-bold">
                    {[formatNumber(value.value, language), value.unit].filter(Boolean).join(' ')}
                  </Text>
                  <Badge
                    tone={FLAG_TONE[value.flag]}
                    label={`${FLAG_ICON[value.flag]}${t(`labs.flags.${value.flag}`)}`}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : null}

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

      <Button variant="ghost" label={t('common.delete')} onPress={remove} className="self-center" />
    </ScreenLayout>
  )
}
