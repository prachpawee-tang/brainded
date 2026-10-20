const pad = (n: number) => String(n).padStart(2, '0')

/** Local calendar date → `YYYY-MM-DD` (no time-zone shift). */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** `YYYY-MM-DD` → local Date at midnight. */
export const fromIsoDate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}
