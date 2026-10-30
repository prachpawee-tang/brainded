import { describe, expect, it } from 'vitest'
import {
  COMBINATION_COUNT,
  combinationsOf,
  findColor,
  getCombination,
  listCombinations,
  nearestColors,
  searchColors,
  WADA_COLORS,
} from './palette'

describe('Wada palette', () => {
  it('has 159 colors with unique slugs and 348 combinations of 2–4 colors', () => {
    expect(WADA_COLORS).toHaveLength(159)
    expect(new Set(WADA_COLORS.map((c) => c.slug)).size).toBe(159)
    expect(COMBINATION_COUNT).toBe(348)
    const sizes = listCombinations().map((c) => c.colors.length)
    expect(sizes.filter((n) => n === 2)).toHaveLength(120)
    expect(sizes.filter((n) => n === 3)).toHaveLength(120)
    expect(sizes.filter((n) => n === 4)).toHaveLength(108)
  })

  it('looks up colors and their combinations', () => {
    const pink = findColor('hermosa-pink')
    expect(pink).toMatchObject({
      name: 'Hermosa Pink',
      hex: '#f9c1ce',
      rgb: [249, 193, 206],
      cmyk: [0, 30, 6, 0],
    })
    expect(combinationsOf('hermosa-pink')).toEqual([176, 227, 273])
    expect(getCombination(176)?.colors.map((c) => c.slug)).toContain('hermosa-pink')
    expect(findColor('nope')).toBeUndefined()
    expect(getCombination(0)).toBeUndefined()
    expect(getCombination(349)).toBeUndefined()
  })

  it('filters combinations by size', () => {
    expect(listCombinations(4)).toHaveLength(108)
    expect(listCombinations(4)[0]?.number).toBeGreaterThan(0)
  })
})

describe('searchColors', () => {
  it('matches names by contains, ignoring case', () => {
    const names = searchColors('pink').map((r) => r.color.name)
    expect(names).toContain('Hermosa Pink')
    expect(searchColors('PINK').length).toBe(names.length)
  })

  it('finds the nearest colors for a HEX code', () => {
    const [first] = searchColors('#f9c1ce')
    expect(first).toMatchObject({ color: { slug: 'hermosa-pink' }, deltaE: 0 })
  })

  it('reads short words as names, not 3-digit HEX codes', () => {
    expect(searchColors('red').every((r) => Number.isNaN(r.deltaE))).toBe(true)
    expect(searchColors('bad')).toEqual([])
    expect(searchColors('#bad')[0]?.deltaE).toBeGreaterThanOrEqual(0)
    expect(searchColors('f9c1ce')[0]?.color.slug).toBe('hermosa-pink')
  })

  it('returns nothing for blank input', () => {
    expect(searchColors('  ')).toEqual([])
  })
})

describe('nearestColors', () => {
  it('ranks by ΔE OK', () => {
    const results = nearestColors('#f8c0cd', 3)
    expect(results).toHaveLength(3)
    expect(results[0]?.color.slug).toBe('hermosa-pink')
    expect(results[0]?.deltaE).toBeLessThan(0.02)
    expect((results[1]?.deltaE ?? 0) >= (results[0]?.deltaE ?? 0)).toBe(true)
  })
})
