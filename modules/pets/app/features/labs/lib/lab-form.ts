import { LAB_SECTIONS, type LabSection } from '../../../../shared/health'
import { type LabTest, normalizeLabValue, parseLabInput } from '../../../../shared/lab-catalog'
import { parseDecimal } from '../../../lib/format'

/** Editor row: everything as typed, so partial input survives re-renders. */
export type LabRow = {
  key: number
  section: LabSection
  code: string | null
  name: string
  value: string
  unit: string
  refLow: string
  refHigh: string
  /** Unit the range is written in when it came prefilled/saved; null once typed by hand. */
  rangeUnit: string | null
}

type Range = { unit?: string | null; refLow?: number | null; refHigh?: number | null }

let nextRowKey = 1
const hasRange = (r?: Range | null) => r?.refLow != null || r?.refHigh != null
const text = (n: number | null | undefined) => (n == null ? '' : String(n))

export const newLabRow = (fields: Partial<Omit<LabRow, 'key'>> = {}): LabRow => ({
  section: 'OTHER',
  code: null,
  name: '',
  value: '',
  unit: '',
  refLow: '',
  refHigh: '',
  rangeUnit: null,
  ...fields,
  key: nextRowKey++,
})

/** Reports print numeric tests by code (CREA) and qualitative ones by name (Blood parasites). */
export const rowFromTest = (test: LabTest, previous?: Range | null) =>
  newLabRow({
    section: test.section,
    code: test.code,
    name: test.kind === 'NUMERIC' ? test.code : test.en,
    unit: previous?.unit ?? (test.kind === 'NUMERIC' ? test.unit : ''),
    refLow: text(previous?.refLow),
    refHigh: text(previous?.refHigh),
    rangeUnit: hasRange(previous) ? (previous?.unit ?? null) : null,
  })

export const rowFromValue = (v: {
  section: LabSection
  code: string
  name: string
  value?: number | null
  textValue?: string | null
  unit?: string | null
  refLow?: number | null
  refHigh?: number | null
}) =>
  newLabRow({
    section: v.section,
    code: v.code,
    name: v.name,
    value: v.textValue ?? text(v.value),
    unit: v.unit ?? '',
    refLow: text(v.refLow),
    refHigh: text(v.refHigh),
    rangeUnit: hasRange(v) ? (v.unit ?? null) : null,
  })

/**
 * Apply an edit. Switching a prefilled range's unit (e.g. cells/µL → ×10³/µL) converts the range
 * too, so a copied range never silently mismatches the result's unit.
 */
export const patchRow = (row: LabRow, patch: Partial<LabRow>): Partial<LabRow> => {
  if ('refLow' in patch || 'refHigh' in patch) return { ...patch, rangeUnit: null }
  if (patch.unit === undefined || !row.code || !row.rangeUnit) return patch
  const from = normalizeLabValue(row.code, 1, row.rangeUnit)
  const to = normalizeLabValue(row.code, 1, patch.unit)
  if (!from || !to || from.value === to.value) return patch
  const scale = (input: string) => {
    const parsed = parseLabInput(input)
    if (!parsed || !('value' in parsed)) return input
    return String(Math.round(((parsed.value * from.value) / to.value) * 1e6) / 1e6)
  }
  return { ...patch, refLow: scale(row.refLow), refHigh: scale(row.refHigh), rangeUnit: patch.unit }
}

/** Rows → API values. One result input: numbers become `value`, anything else `textValue`. */
export const toLabValues = (rows: readonly LabRow[]) =>
  rows.map((row) => {
    const parsed = parseLabInput(row.value)
    return {
      section: row.section,
      code: row.code,
      name: row.name,
      value: parsed && 'value' in parsed ? parsed.value : null,
      textValue: parsed && 'textValue' in parsed ? parsed.textValue : null,
      unit: row.unit.trim() || null,
      refLow: parseLabNumber(row.refLow),
      refHigh: parseLabNumber(row.refHigh),
    }
  })

const parseLabNumber = (input: string) => {
  const parsed = parseLabInput(input)
  if (!parsed) return null
  return 'value' in parsed ? parsed.value : (parseDecimal(input) ?? Number.NaN)
}

/** Report order (CBC → … → Other), keeping each item's original index for error paths. */
export const groupBySection = <T extends { section: LabSection }>(items: readonly T[]) =>
  LAB_SECTIONS.map((section) => ({
    section,
    items: items.flatMap((item, index) => (item.section === section ? [{ item, index }] : [])),
  })).filter((group) => group.items.length > 0)
