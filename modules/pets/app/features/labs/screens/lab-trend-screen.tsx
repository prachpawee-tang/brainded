import { useQuery } from '@apollo/client/react'
import { Badge, EmptyState, LineChart, ListItem, ScreenLayout, Skeleton, Text } from '@brain/ui'
import { router, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'
import { findLabTest } from '../../../../shared/lab-catalog'
import { HeaderBar } from '../../../components/header-bar'
import { PetLabTrendQuery } from '../../../graphql/health'
import { usePetsChartColor } from '../../../lib/chart-color'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { FLAG_TONE, formatLabNumber, useLabDisplay } from '../lib/lab-display'
import { chartLabTrend } from '../lib/trend'

const MIN_POINTS = 2

/** One test over time: chart on a common unit, the latest range, and every result as entered. */
export const LabTrendScreen = () => {
  const { id, code } = useLocalSearchParams<{ id: string; code: string }>()
  const labels = usePetLabels()
  const { t, language } = labels
  const display = useLabDisplay()
  const color = usePetsChartColor()
  const { data, loading } = useQuery(PetLabTrendQuery, {
    variables: { id, code },
    // The editor's prefill caches this query while it isn't on screen; always check for newer results.
    fetchPolicy: 'cache-and-network',
  })
  const points = data?.pet?.labTrend ?? []
  const test = findLabTest(code)
  const title = test
    ? test.kind === 'NUMERIC'
      ? `${test.code} · ${test.en}`
      : test.en
    : (points.at(-1)?.name ?? code)
  const { unit, charted, skipped } = chartLabTrend(code, points)
  const latest = points.at(-1)
  const latestRange = latest ? display.range(latest) : null
  const format = (y: number) => [formatLabNumber(y, language), unit].filter(Boolean).join(' ')
  const average = charted.reduce((sum, c) => sum + c.y, 0) / (charted.length || 1)

  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} fallbackHref={`/pets/${id}/labs`} />
      <Text variant="display">{title}</Text>
      {loading && !data ? (
        <Skeleton className="h-52 rounded-xl" />
      ) : points.length === 0 ? (
        <EmptyState glyph="🧪" message={t('labs.empty')} />
      ) : (
        <>
          <View className="gap-3 rounded-xl border border-border bg-surface p-4">
            {charted.length >= MIN_POINTS ? (
              <LineChart
                points={charted.map((c) => ({
                  key: c.point.id,
                  x: Date.parse(c.point.takenOn),
                  y: c.y,
                }))}
                color={color}
                formatY={format}
                formatX={(x) => labels.date(new Date(x).toISOString().slice(0, 10))}
                accessibilityLabel={charted
                  .map((c) => `${labels.date(c.point.takenOn)}: ${format(c.y)}`)
                  .join(', ')}
                average={average}
              />
            ) : (
              <Text tone="muted" className="py-4 text-center">
                {t('labs.trendEmpty')}
              </Text>
            )}
            {latestRange ? (
              <Text variant="caption" tone="muted">
                {t('labs.latestRange', { range: latestRange })}
              </Text>
            ) : null}
            {skipped.length > 0 ? (
              <Text variant="caption" tone="muted">
                {t('labs.notCharted')}:{' '}
                {skipped.map((p) => `${labels.date(p.takenOn)} ${display.result(p)}`).join(', ')}
              </Text>
            ) : null}
          </View>
          <View className="gap-2">
            <Text variant="caption" tone="muted" className="font-sans-medium">
              {t('labs.history')}
            </Text>
            <View className="rounded-xl border border-border bg-surface px-4">
              {[...points].reverse().map((point) => (
                <ListItem
                  key={point.id}
                  title={display.result(point)}
                  subtitle={labels.date(point.takenOn)}
                  onPress={() => router.push(`/pets/${id}/labs/${point.labResultId}`)}
                  trailing={
                    <Badge tone={FLAG_TONE[point.flag]} label={display.flagLabel(point.flag)} />
                  }
                />
              ))}
            </View>
          </View>
        </>
      )}
    </ScreenLayout>
  )
}
