import { LAB_SECTIONS, type LabSection } from '../../../../shared/health'
import { type LabTest, parseLabInput } from '../../../../shared/lab-catalog'
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
}

type Range = { unit?: string | null; refLow?: number | null; refHigh?: number | null }

let nextRowKey = 1
const text = (n: number | null | undefined) => (n == null ? '' : String(n))

export const newLabRow = (fields: Partial<Omit<LabRow, 'key'>> = {}): LabRow => ({
  section: 'OTHER',
  code: null,
  name: '',
  value: '',
  unit: '',
  refLow: '',
  refHigh: '',
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
  })

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
