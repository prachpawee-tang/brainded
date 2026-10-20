import {
  formatDate,
  formatMonth,
  formatWeightKg,
  groupByMonth,
  petAge,
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
