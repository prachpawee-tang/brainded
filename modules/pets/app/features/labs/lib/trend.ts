import { findLabTest, normalizeLabValue } from '../../../../shared/lab-catalog'

type Point = { id: string; takenOn: string; value?: number | null; unit?: string | null }

/**
 * Chartable points for one test. Catalog tests are converted to their canonical unit; custom tests
 * use the latest numeric unit as-is. Anything that can't be put on that scale is left out
 * (and listed separately) rather than silently mixed.
 */
export const chartLabTrend = <T extends Point>(code: string, points: readonly T[]) => {
  const test = findLabTest(code)
  const numeric = points.filter((p): p is T & { value: number } => p.value != null)
  const fallbackUnit = numeric.at(-1)?.unit ?? null
  const unit = test?.kind === 'NUMERIC' ? test.unit : fallbackUnit
  const charted: { point: T; y: number }[] = []
  const skipped: T[] = []
  for (const point of numeric) {
    const normalized =
      test?.kind === 'NUMERIC'
        ? normalizeLabValue(code, point.value, point.unit ?? test.unit)
        : (point.unit ?? null) === fallbackUnit
          ? { value: point.value }
          : null
    if (normalized) charted.push({ point, y: normalized.value })
    else skipped.push(point)
  }
  return { unit, charted, skipped }
}
