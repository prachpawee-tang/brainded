// Isomorphic color math: HEX parsing, sRGB → OKLab, ΔE OK distance, WCAG contrast.

export type Oklab = { l: number; a: number; b: number }

const SHORT_HEX = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i
const LONG_HEX = /^#?([0-9a-f]{6})$/i

/** Normalizes `#abc`, `abc`, `#aabbcc` or `aabbcc` to lowercase `#aabbcc`; null if not a HEX code. */
export const parseHex = (input: string): string | null => {
  const text = input.trim()
  const short = SHORT_HEX.exec(text)
  if (short)
    return `#${short
      .slice(1, 4)
      .map((c) => c + c)
      .join('')}`.toLowerCase()
  const long = LONG_HEX.exec(text)
  return long ? `#${long[1]}`.toLowerCase() : null
}

const channels = (hex: string) => {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => c / 255)
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

/** sRGB → OKLab (Björn Ottosson, 2020). */
export const toOklab = (hex: string): Oklab => {
  const [r = 0, g = 0, b = 0] = channels(hex).map(toLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

export const deltaEOklab = (x: Oklab, y: Oklab) => Math.hypot(x.l - y.l, x.a - y.a, x.b - y.b)

/** ΔE OK: Euclidean distance in OKLab (≈0.02 is barely noticeable). */
export const deltaE = (hexA: string, hexB: string) => deltaEOklab(toOklab(hexA), toOklab(hexB))

const luminance = (hex: string) => {
  const [r = 0, g = 0, b = 0] = channels(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const contrastRatio = (hexA: string, hexB: string) => {
  const [hi, lo] = [luminance(hexA), luminance(hexB)].sort((p, q) => q - p)
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05)
}

/** Text on a data-driven swatch: black or white, whichever reads better (WCAG contrast). */
export const readableTextOn = (hex: string) =>
  contrastRatio(hex, '#000000') >= contrastRatio(hex, '#ffffff') ? '#000000' : '#ffffff'
