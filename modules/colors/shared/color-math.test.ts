import { describe, expect, it } from 'vitest'
import { contrastRatio, deltaE, parseHex, readableTextOn, toOklab } from './color-math'

describe('parseHex', () => {
  it.each([
    ['#F9C1CE', '#f9c1ce'],
    ['f9c1ce', '#f9c1ce'],
    ['#abc', '#aabbcc'],
    [' ABC ', '#aabbcc'],
  ])('%s → %s', (input, hex) => {
    expect(parseHex(input)).toBe(hex)
  })

  it.each(['', '#ab', '#abcd', 'pink', '#gggggg'])('rejects %j', (input) => {
    expect(parseHex(input)).toBeNull()
  })
})

describe('OKLab', () => {
  it('matches reference values', () => {
    const white = toOklab('#ffffff')
    expect(white.l).toBeCloseTo(1, 3)
    expect(white.a).toBeCloseTo(0, 3)
    const red = toOklab('#ff0000')
    expect(red.l).toBeCloseTo(0.628, 3)
    expect(red.a).toBeCloseTo(0.2249, 3)
    expect(red.b).toBeCloseTo(0.1258, 3)
  })

  it('measures distance as ΔE OK', () => {
    expect(deltaE('#f9c1ce', '#f9c1ce')).toBe(0)
    expect(deltaE('#000000', '#ffffff')).toBeCloseTo(1, 3)
  })
})

describe('readableTextOn', () => {
  it('picks the text color with more contrast', () => {
    expect(readableTextOn('#f9c1ce')).toBe('#000000')
    expect(readableTextOn('#1a1a40')).toBe('#ffffff')
  })

  it('computes WCAG contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
  })
})
