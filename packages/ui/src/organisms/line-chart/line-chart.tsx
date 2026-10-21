import { useState } from 'react'
import { type GestureResponderEvent, type LayoutChangeEvent, View } from 'react-native'
import Svg, { Circle, Line, Path } from 'react-native-svg'
import { Text } from '../../atoms/text/text'
import { useThemeColors } from '../../lib/use-theme-colors'

export type LineChartPoint = { key: string; x: number; y: number }

export type LineChartProps = {
  /** Chronological points; x is usually a timestamp. */
  points: readonly LineChartPoint[]
  /** Series color (use a validated chart token, e.g. `moduleChartColors`). */
  color: string
  average?: number | undefined
  averageLabel?: string
  formatY: (y: number) => string
  formatX: (x: number) => string
  /** Text summary of the series — the chart itself is decorative for screen readers. */
  accessibilityLabel: string
  height?: number
}

const PAD_X = 12
const PAD_TOP = 12
const PAD_BOTTOM = 12
const DOT_RADIUS = 4
const RING = 2
const Y_HEADROOM = 0.15

export const nearestIndex = (xs: readonly number[], target: number): number =>
  xs.reduce(
    (best, x, i) => (Math.abs(x - target) < Math.abs((xs[best] ?? 0) - target) ? i : best),
    0,
  )

/** Single-series line chart: 2px line, end dot, average reference, press-and-drag readout. */
export const LineChart = ({
  points,
  color,
  average,
  averageLabel,
  formatY,
  formatX,
  accessibilityLabel,
  height = 180,
}: LineChartProps) => {
  const themeColors = useThemeColors()
  const [width, setWidth] = useState(0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const ys = points.map((p) => p.y).concat(average === undefined ? [] : [average])
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const span = maxY - minY || Math.max(Math.abs(maxY) * 0.1, 1)
  const lowY = minY - span * Y_HEADROOM
  const highY = maxY + span * Y_HEADROOM
  const firstX = points[0]?.x ?? 0
  const lastX = points.at(-1)?.x ?? 0
  const spanX = lastX - firstX || 1
  /** One point, or several on the same x (e.g. two weights logged the same day): centre them. */
  const isSingleX = lastX === firstX

  const plotWidth = Math.max(width - PAD_X * 2, 0)
  const plotHeight = height - PAD_TOP - PAD_BOTTOM
  const toX = (x: number) =>
    isSingleX ? PAD_X + plotWidth / 2 : PAD_X + ((x - firstX) / spanX) * plotWidth
  const toY = (y: number) => PAD_TOP + (1 - (y - lowY) / (highY - lowY)) * plotHeight

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`)
    .join(' ')
  const shownIndex = activeIndex ?? points.length - 1
  const shown = points[shownIndex]
  const gridYs = [highY, (highY + lowY) / 2, lowY]

  const scrub = (event: GestureResponderEvent) => {
    const locationX = event.nativeEvent.locationX
    const ratio = plotWidth > 0 ? (locationX - PAD_X) / plotWidth : 1
    setActiveIndex(
      nearestIndex(
        points.map((p) => p.x),
        firstX + ratio * spanX,
      ),
    )
  }

  return (
    <View className="gap-2">
      <View
        className="flex-row items-baseline justify-between gap-3"
        accessibilityLiveRegion="polite"
      >
        <Text variant="title" className="text-2xl">
          {shown ? formatY(shown.y) : ''}
        </Text>
        <Text variant="caption" tone="muted">
          {shown ? formatX(shown.x) : ''}
        </Text>
      </View>
      <View
        testID="line-chart-surface"
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        style={{ height }}
        onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={scrub}
        onResponderMove={scrub}
        onResponderRelease={() => setActiveIndex(null)}
        onResponderTerminate={() => setActiveIndex(null)}
      >
        {width > 0 ? (
          <Svg width={width} height={height}>
            {gridYs.map((y) => (
              <Line
                key={y}
                x1={PAD_X}
                x2={width - PAD_X}
                y1={toY(y)}
                y2={toY(y)}
                stroke={themeColors.border}
                strokeWidth={1}
              />
            ))}
            {average === undefined ? null : (
              <Line
                x1={PAD_X}
                x2={width - PAD_X}
                y1={toY(average)}
                y2={toY(average)}
                stroke={themeColors.textMuted}
                strokeWidth={1}
                opacity={0.6}
              />
            )}
            {points.length > 1 ? (
              <Path
                d={path}
                stroke={color}
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}
            {activeIndex !== null && shown ? (
              <Line
                x1={toX(shown.x)}
                x2={toX(shown.x)}
                y1={PAD_TOP}
                y2={height - PAD_BOTTOM}
                stroke={themeColors.textMuted}
                strokeWidth={1}
              />
            ) : null}
            {shown ? (
              <Circle
                testID="line-chart-dot"
                cx={toX(shown.x)}
                cy={toY(shown.y)}
                r={DOT_RADIUS}
                fill={color}
                stroke={themeColors.surface}
                strokeWidth={RING}
              />
            ) : null}
          </Svg>
        ) : null}
      </View>
      {average === undefined || !averageLabel ? null : (
        <View className="flex-row items-center gap-2">
          <View className="h-px w-4 bg-text-muted" />
          <Text variant="caption" tone="muted">
            {averageLabel}
          </Text>
        </View>
      )}
    </View>
  )
}
