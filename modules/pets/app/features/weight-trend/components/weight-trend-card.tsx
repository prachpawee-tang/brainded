import { useQuery } from '@apollo/client/react'
import { LineChart, SegmentedControl, Skeleton, Text } from '@brain/ui'
import { useState } from 'react'
import { View } from 'react-native'
import { weightStats } from '../../../../shared/health'
import { PetWeightsQuery } from '../../../graphql/health'
import { usePetsChartColor } from '../../../lib/chart-color'
import {
  formatDate,
  formatWeightKg,
  rangeSince,
  WEIGHT_RANGES,
  type WeightRange,
} from '../../../lib/format'
import { usePetLabels } from '../../../lib/use-pet-labels'

const MIN_POINTS_FOR_TREND = 2

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View className="min-w-[45%] flex-1 gap-0.5">
    <Text variant="caption" tone="muted">
      {label}
    </Text>
    <Text className="font-sans-medium">{value}</Text>
  </View>
)

export const WeightTrendCard = ({ petId }: { petId: string }) => {
  const labels = usePetLabels()
  const { t, language } = labels
  const color = usePetsChartColor()
  const [range, setRange] = useState<WeightRange>('6M')
  const since = rangeSince(range)
  const { data, loading } = useQuery(PetWeightsQuery, {
    variables: since ? { id: petId, since } : { id: petId },
  })
  const weights = data?.pet?.weights ?? []
  const stats = weightStats(weights.map((w) => w.weightGrams))
  const first = weights[0]
  const last = weights.at(-1)

  const chart = () => {
    if (loading && !data) return <Skeleton className="h-52 rounded-lg" />
    if (!stats || !first || !last || weights.length < MIN_POINTS_FOR_TREND) {
      return (
        <Text tone="muted" className="py-6 text-center">
          {t('weight.empty')}
        </Text>
      )
    }
    return (
      <View className="gap-4">
        <LineChart
          points={weights.map((w) => ({
            key: w.id,
            x: Date.parse(w.measuredOn),
            y: w.weightGrams,
          }))}
          color={color}
          average={stats.average}
          averageLabel={t('weight.averageLine', { value: formatWeightKg(stats.average, language) })}
          formatY={labels.kg}
          formatX={(x) => formatDate(new Date(x).toISOString().slice(0, 10), language)}
          accessibilityLabel={t('weight.summary', {
            first: formatWeightKg(first.weightGrams, language),
            last: formatWeightKg(last.weightGrams, language),
            from: labels.date(first.measuredOn),
            to: labels.date(last.measuredOn),
            average: formatWeightKg(stats.average, language),
          })}
        />
        <View className="flex-row flex-wrap gap-y-3">
          <Stat label={t('weight.average')} value={labels.kg(stats.average)} />
          <Stat label={t('weight.change')} value={labels.kgDelta(stats.change)} />
          <Stat label={t('weight.min')} value={labels.kg(stats.min)} />
          <Stat label={t('weight.max')} value={labels.kg(stats.max)} />
        </View>
      </View>
    )
  }

  return (
    <View className="gap-4 rounded-xl border border-border bg-surface p-4">
      <SegmentedControl
        label={t('weight.title')}
        options={WEIGHT_RANGES.map((value) => ({ value, label: t(`weight.ranges.${value}`) }))}
        value={range}
        onChange={setRange}
      />
      {chart()}
    </View>
  )
}
