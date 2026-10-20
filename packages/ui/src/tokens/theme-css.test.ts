import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildThemeCss } from './theme-css'

describe('buildThemeCss', () => {
  const css = buildThemeCss()

  it('declares semantic colors for light and dark variants', () => {
    expect(css).toMatch(/@variant light \{[^}]*--color-bg: #/)
    expect(css).toMatch(/@variant dark \{[^}]*--color-bg: #/)
  })

  it('exposes module accent colors as color-module-<id>', () => {
    expect(css).toContain('--color-module-pets:')
  })

  it('declares spacing, radius and font tokens in @theme', () => {
    expect(css).toMatch(/@theme \{[^}]*--spacing: 4px;/)
    expect(css).toContain('--radius-md: 12px;')
    expect(css).toContain('--font-sans:')
  })

  it('matches the committed theme.css (run `pnpm --filter @brain/ui build:theme`)', () => {
    const committed = readFileSync(join(__dirname, '../../theme.css'), 'utf8')
    expect(committed).toBe(css)
  })
})
