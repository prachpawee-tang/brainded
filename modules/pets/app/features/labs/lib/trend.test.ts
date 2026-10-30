import { chartLabTrend } from './trend'

const p = (id: string, value: number | null, unit: string | null) => ({
  id,
  takenOn: `2026-0${id}-01`,
  value,
  unit,
})

describe('chartLabTrend', () => {
  it('puts catalog values on the canonical unit and leaves out unknown units', () => {
    const { unit, charted, skipped } = chartLabTrend('WBC', [
      p('1', 12200, 'cells/µL'),
      p('2', 9.5, '×10³/µL'),
      p('3', 60, '%'),
      p('4', null, null),
    ])
    expect(unit).toBe('×10³/µL')
    expect(charted.map((c) => c.y)).toEqual([12.2, 9.5])
    expect(skipped.map((s) => s.id)).toEqual(['3'])
  })

  it('assumes the canonical unit when none was entered', () => {
    expect(chartLabTrend('ALT', [p('1', 50, null)]).charted.map((c) => c.y)).toEqual([50])
  })

  it('charts custom tests in their latest unit', () => {
    const { unit, charted, skipped } = chartLabTrend('KETONE', [
      p('1', 1, 'mmol/L'),
      p('2', 3, 'mg/dL'),
      p('3', 2, 'mg/dL'),
    ])
    expect(unit).toBe('mg/dL')
    expect(charted.map((c) => c.y)).toEqual([3, 2])
    expect(skipped.map((s) => s.id)).toEqual(['1'])
  })
})
