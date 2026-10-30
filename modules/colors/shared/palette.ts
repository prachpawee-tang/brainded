import { deltaEOklab, type Oklab, parseHex, toOklab } from './color-math'
import data from './data/wada-colors.json' with { type: 'json' }

// Sanzo Wada's 159 colors and 348 combinations (MIT dataset, see data/LICENSE.md). Static, bundled.

export type WadaColor = {
  /** kebab-case of the name, used in URLs and favorites. */
  slug: string
  name: string
  hex: string
  rgb: readonly [number, number, number]
  cmyk: readonly [number, number, number, number]
  /** Swatch group in the book (0–5). */
  swatch: number
  combinations: readonly number[]
}
export type WadaCombination = { number: number; colors: readonly WadaColor[] }
export type ColorMatch = { color: WadaColor; deltaE: number }

const slugify = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const WADA_COLORS: readonly WadaColor[] = data.map((c) => ({
  slug: slugify(c.name),
  name: c.name,
  hex: c.hex.toLowerCase(),
  rgb: c.rgb as [number, number, number],
  cmyk: c.cmyk as [number, number, number, number],
  swatch: c.swatch,
  combinations: c.combinations,
}))

const BY_SLUG = new Map(WADA_COLORS.map((c) => [c.slug, c]))
const OKLAB = new Map<string, Oklab>(WADA_COLORS.map((c) => [c.slug, toOklab(c.hex)]))

const COMBINATIONS: readonly WadaCombination[] = (() => {
  const max = Math.max(...WADA_COLORS.flatMap((c) => c.combinations))
  return Array.from({ length: max }, (_, i) => ({
    number: i + 1,
    colors: WADA_COLORS.filter((c) => c.combinations.includes(i + 1)),
  }))
})()

export const COMBINATION_COUNT = COMBINATIONS.length

export const findColor = (slug: string) => BY_SLUG.get(slug)
export const getCombination = (n: number) => COMBINATIONS[n - 1]
export const combinationsOf = (slug: string) => [...(findColor(slug)?.combinations ?? [])]

/** All combinations in book order, optionally only those of `size` colors. */
export const listCombinations = (size?: number) =>
  size ? COMBINATIONS.filter((c) => c.colors.length === size) : [...COMBINATIONS]

export const nearestColors = (hex: string, limit = 5): ColorMatch[] => {
  const target = toOklab(hex)
  return WADA_COLORS.map((color) => ({
    color,
    deltaE: deltaEOklab(target, OKLAB.get(color.slug) as Oklab),
  }))
    .sort((a, b) => a.deltaE - b.deltaE)
    .slice(0, limit)
}

/** Six hex digits, or `#` + 3/6: so words like "bad" stay name searches. */
const looksLikeHex = (text: string) => text.startsWith('#') || /^[0-9a-f]{6}$/.test(text)

/** A HEX code → nearest colors; anything else → names containing the text. */
export const searchColors = (query: string): ColorMatch[] => {
  const text = query.trim().toLowerCase()
  if (!text) return []
  const hex = looksLikeHex(text) ? parseHex(text) : null
  if (hex) return nearestColors(hex)
  return WADA_COLORS.filter((c) => c.name.toLowerCase().includes(text)).map((color) => ({
    color,
    deltaE: Number.NaN,
  }))
}
