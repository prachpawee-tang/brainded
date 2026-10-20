const HEX_PATTERN = /^#[0-9a-f]{6}$/i

const channelToLinear = (channel: number): number => {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const relativeLuminance = (hex: string): number => {
  if (!HEX_PATTERN.test(hex)) throw new Error(`Invalid hex color: ${hex}`)
  const [r, g, b] = [1, 3, 5].map((i) => channelToLinear(Number.parseInt(hex.slice(i, i + 2), 16)))
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)
}

/** WCAG 2.x contrast ratio between two #rrggbb colors (1–21). */
export const contrastRatio = (a: string, b: string): number => {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05)
}
