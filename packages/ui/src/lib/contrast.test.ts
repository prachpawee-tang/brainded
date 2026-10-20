import { contrastRatio } from './contrast'

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
  })

  it('is 1 for identical colors', () => {
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5)
  })

  it('is symmetric', () => {
    expect(contrastRatio('#123456', '#fedcba')).toBeCloseTo(contrastRatio('#fedcba', '#123456'), 5)
  })

  it('throws on non 6-digit hex input', () => {
    expect(() => contrastRatio('red', '#ffffff')).toThrow('Invalid hex color: red')
  })
})
