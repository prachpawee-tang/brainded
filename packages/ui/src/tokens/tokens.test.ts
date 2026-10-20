import { contrastRatio } from '../lib/contrast'
import { colors, moduleChartColors, THEMES } from './color'

const WCAG_AA_TEXT = 4.5
const WCAG_AA_LARGE = 3

describe.each(THEMES)('%s theme colors', (theme) => {
  const c = colors[theme]

  it.each([
    ['text', 'bg'],
    ['text', 'surface'],
    ['textMuted', 'bg'],
    ['textMuted', 'surface'],
    ['onPrimary', 'primary'],
  ] as const)('%s on %s meets WCAG AA for body text', (fg, bg) => {
    expect(contrastRatio(c[fg], c[bg])).toBeGreaterThanOrEqual(WCAG_AA_TEXT)
  })

  it.each(['primary', 'success', 'warning', 'danger'] as const)(
    '%s is distinguishable on bg (large text / icons)',
    (token) => {
      expect(contrastRatio(c[token], c.bg)).toBeGreaterThanOrEqual(WCAG_AA_LARGE)
    },
  )

  it.each(Object.keys(moduleChartColors))(
    '%s chart color reaches 3:1 on the card surface',
    (moduleId) => {
      expect(
        contrastRatio(moduleChartColors[moduleId]?.[theme] ?? '#000000', c.surface),
      ).toBeGreaterThanOrEqual(WCAG_AA_LARGE)
    },
  )

  it('defines the same token names as every other theme', () => {
    expect(Object.keys(c).sort()).toEqual(Object.keys(colors.light).sort())
  })
})
