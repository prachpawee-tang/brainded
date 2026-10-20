import { describe, expect, it } from 'vitest'
import {
  appointmentInputSchema,
  isDoseDay,
  LAB_PRESETS,
  labFlag,
  labResultInputSchema,
  medicationInputSchema,
  weightStats,
} from './health'
import { toValidationIssues } from './validation'

const issues = (schema: { safeParse: (v: unknown) => { error?: unknown } }, value: unknown) =>
  toValidationIssues(schema.safeParse(value).error as never)

describe('labFlag', () => {
  it.each([
    [5, 1, 10, 'NORMAL'],
    [0.5, 1, 10, 'LOW'],
    [11, 1, 10, 'HIGH'],
    [11, null, 10, 'HIGH'],
    [0.5, 1, null, 'LOW'],
    [5, null, null, 'UNKNOWN'],
    [10, 1, 10, 'NORMAL'],
  ] as const)('%d in [%s, %s] → %s', (value, low, high, flag) => {
    expect(labFlag(value, low, high)).toBe(flag)
  })
})

describe('labResultInputSchema', () => {
  const valid = {
    takenOn: '2026-10-01',
    title: 'ตรวจเลือด',
    values: [{ name: 'ALT', value: 45, unit: 'U/L', refLow: 10, refHigh: 100 }],
  }

  it('accepts a result with values and trims text', () => {
    expect(
      labResultInputSchema.parse({ ...valid, clinic: '  ', title: ' ตรวจเลือด ' }),
    ).toMatchObject({ title: 'ตรวจเลือด', clinic: null, photoKeys: [] })
  })

  it('requires a title and valid values', () => {
    expect(
      issues(labResultInputSchema, {
        ...valid,
        title: '',
        values: [{ name: '', value: Number.NaN }],
      }),
    ).toEqual([
      { path: ['title'], code: 'REQUIRED' },
      { path: ['values', 0, 'name'], code: 'REQUIRED' },
      { path: ['values', 0, 'value'], code: 'INVALID' },
    ])
  })

  it('rejects a reference range where low > high', () => {
    expect(
      issues(labResultInputSchema, {
        ...valid,
        values: [{ name: 'ALT', value: 1, refLow: 10, refHigh: 5 }],
      }),
    ).toEqual([{ path: ['values', 0, 'refHigh'], code: 'RANGE_INVERTED' }])
  })

  it('allows a result with only photos but not a completely empty one', () => {
    expect(labResultInputSchema.safeParse({ ...valid, values: [], photoKeys: ['k'] }).success).toBe(
      true,
    )
    expect(issues(labResultInputSchema, { ...valid, values: [], photoKeys: [] })).toEqual([
      { path: ['values'], code: 'EMPTY_RESULT' },
    ])
  })

  it('ships presets with names and units', () => {
    expect(LAB_PRESETS.map((p) => p.name)).toContain('ALT')
    expect(LAB_PRESETS.every((p) => p.unit.length > 0)).toBe(true)
  })
})

describe('medicationInputSchema', () => {
  const valid = { name: 'Apoquel', times: ['20:00', '08:00'], everyDays: 1, startOn: '2026-10-01' }

  it('sorts and de-duplicates times', () => {
    expect(
      medicationInputSchema.parse({ ...valid, times: ['20:00', '08:00', '08:00'] }).times,
    ).toEqual(['08:00', '20:00'])
  })

  it.each([
    [{ times: [] }, [{ path: ['times'], code: 'REQUIRED' }]],
    [{ times: ['8am'] }, [{ path: ['times', 0], code: 'INVALID_TIME' }]],
    [{ everyDays: 0 }, [{ path: ['everyDays'], code: 'TOO_SMALL' }]],
    [{ endOn: '2026-09-01' }, [{ path: ['endOn'], code: 'BEFORE_START' }]],
  ])('rejects %j', (patch, expected) => {
    expect(issues(medicationInputSchema, { ...valid, ...patch })).toEqual(expected)
  })
})

describe('isDoseDay', () => {
  const med = { startOn: '2026-10-01', endOn: '2026-10-31', everyDays: 7 }
  it.each([
    ['2026-09-30', false],
    ['2026-10-01', true],
    ['2026-10-02', false],
    ['2026-10-08', true],
    ['2026-11-05', false],
  ])('%s → %s', (date, expected) => {
    expect(isDoseDay(med, date)).toBe(expected)
  })

  it('treats a missing end date as ongoing', () => {
    expect(isDoseDay({ startOn: '2026-01-01', endOn: null, everyDays: 1 }, '2030-01-01')).toBe(true)
  })
})

describe('appointmentInputSchema', () => {
  it('requires a reason and a valid date-time', () => {
    expect(issues(appointmentInputSchema, { scheduledAt: 'nope', reason: '' })).toEqual([
      { path: ['scheduledAt'], code: 'INVALID_DATE' },
      { path: ['reason'], code: 'REQUIRED' },
    ])
    expect(
      appointmentInputSchema.safeParse({
        scheduledAt: '2026-11-01T09:30:00+07:00',
        reason: 'ฉีดวัคซีน',
      }).success,
    ).toBe(true)
  })
})

describe('weightStats', () => {
  it('computes average, min, max and change', () => {
    expect(weightStats([4000, 4400, 4300])).toEqual({
      average: 4233,
      min: 4000,
      max: 4400,
      change: 300,
    })
  })

  it('returns null for no data', () => {
    expect(weightStats([])).toBeNull()
  })
})
