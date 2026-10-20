import { fromIsoDate, toIsoDate } from './date-value'

describe('date values', () => {
  it('round-trips local dates without time-zone shifts', () => {
    expect(toIsoDate(fromIsoDate('2024-02-29'))).toBe('2024-02-29')
    expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
