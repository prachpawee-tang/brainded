import {
  formatDate,
  formatMonth,
  formatTime,
  formatWeightKg,
  groupByMonth,
  isValidTime,
  localDateTimeToIso,
  parseDecimal,
  petAge,
  rangeSince,
  speciesEmoji,
  weightDeltaGrams,
} from './format'

describe('petAge', () => {
  const today = new Date(2026, 9, 20)
  it.each([
    ['2026-10-01', { years: 0, months: 0 }],
    ['2026-08-21', { years: 0, months: 1 }],
    ['2024-07-20', { years: 2, months: 3 }],
    ['2025-10-21', { years: 0, months: 11 }],
    ['2016-10-20', { years: 10, months: 0 }],
  ])('%s → %j', (birthDate, age) => {
    expect(petAge(birthDate, today)).toEqual(age)
  })
})

describe('weights', () => {
  it('formats grams as kg with up to two decimals in the locale', () => {
    expect(formatWeightKg(4200, 'en')).toBe('4.2')
    expect(formatWeightKg(12345, 'th')).toBe('12.35')
  })

  it('computes the change from the previous weight', () => {
    expect(weightDeltaGrams({ weightGrams: 4350 }, { weightGrams: 4200 })).toBe(150)
    expect(weightDeltaGrams({ weightGrams: 4350 }, null)).toBeNull()
  })
})

describe('dates', () => {
  it('uses the Buddhist year in Thai and the Gregorian year in English', () => {
    expect(formatDate('2026-05-01', 'th')).toMatch(/2569/)
    expect(formatDate('2026-05-01', 'en')).toMatch(/2026/)
  })

  it('labels months', () => {
    expect(formatMonth('2026-05', 'en')).toMatch(/May 2026/)
  })

  it('groups items by month, keeping order', () => {
    const items = [
      { occurredOn: '2026-05-03' },
      { occurredOn: '2026-05-01' },
      { occurredOn: '2026-04-30' },
    ]
    expect(groupByMonth(items)).toEqual([
      { month: '2026-05', items: [items[0], items[1]] },
      { month: '2026-04', items: [items[2]] },
    ])
  })
})

describe('speciesEmoji', () => {
  it.each([
    ['DOG', '🐶'],
    ['CAT', '🐱'],
    ['OTHER', '🐾'],
  ] as const)('%s → %s', (species, emoji) => {
    expect(speciesEmoji(species)).toBe(emoji)
  })
})

describe('time and ranges', () => {
  it('formats a time in 24h', () => {
    expect(formatTime('2026-11-01T02:30:00.000Z', 'en', 'Asia/Bangkok')).toBe('09:30')
  })

  it('builds an ISO instant from a local date and time', () => {
    expect(localDateTimeToIso('2026-11-01', '09:30')).toBe(
      new Date(2026, 10, 1, 9, 30).toISOString(),
    )
  })

  it.each([
    ['3M', '2026-07-20'],
    ['6M', '2026-04-20'],
    ['1Y', '2025-10-20'],
    ['ALL', null],
  ] as const)('range %s starts at %s', (range, since) => {
    expect(rangeSince(range, new Date(2026, 9, 20))).toBe(since)
  })

  it('validates HH:MM', () => {
    expect(isValidTime('08:05')).toBe(true)
    expect(isValidTime('8:05')).toBe(false)
    expect(isValidTime('24:00')).toBe(false)
  })

  it('parses decimal input with comma or dot', () => {
    expect(parseDecimal('4,5')).toBe(4.5)
    expect(parseDecimal(' 12.25 ')).toBe(12.25)
    expect(parseDecimal('')).toBeNull()
    expect(Number.isNaN(parseDecimal('abc'))).toBe(true)
  })
})
