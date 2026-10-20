import { fromIsoDate } from '@brain/ui'
import type { PetSpecies } from '../../shared/validation'

const GRAMS_PER_KG = 1000
const MONTHS_PER_YEAR = 12

/** App language → Intl locale. Thai uses the Buddhist calendar by default (2569 = 2026). */
const intlLocale = (language: string) => (language.startsWith('th') ? 'th-TH' : 'en-GB')

export const petAge = (birthDate: string, today: Date = new Date()) => {
  const born = fromIsoDate(birthDate)
  let months =
    (today.getFullYear() - born.getFullYear()) * MONTHS_PER_YEAR +
    (today.getMonth() - born.getMonth())
  if (today.getDate() < born.getDate()) months -= 1
  months = Math.max(months, 0)
  return { years: Math.floor(months / MONTHS_PER_YEAR), months: months % MONTHS_PER_YEAR }
}

export const formatWeightKg = (grams: number, language: string) =>
  new Intl.NumberFormat(intlLocale(language), { maximumFractionDigits: 2 }).format(
    grams / GRAMS_PER_KG,
  )

export const weightDeltaGrams = (
  latest: { weightGrams: number },
  previous: { weightGrams: number } | null | undefined,
) => (previous ? latest.weightGrams - previous.weightGrams : null)

export const formatDate = (isoDate: string, language: string) =>
  new Intl.DateTimeFormat(intlLocale(language), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fromIsoDate(isoDate))

export const formatMonth = (monthKey: string, language: string) =>
  new Intl.DateTimeFormat(intlLocale(language), { month: 'long', year: 'numeric' }).format(
    fromIsoDate(`${monthKey}-01`),
  )

/** Consecutive grouping by `YYYY-MM`; input is already sorted newest first. */
export const groupByMonth = <T extends { occurredOn: string }>(items: readonly T[]) =>
  items.reduce<{ month: string; items: T[] }[]>((groups, item) => {
    const month = item.occurredOn.slice(0, 7)
    const last = groups.at(-1)
    if (last?.month === month) last.items.push(item)
    else groups.push({ month, items: [item] })
    return groups
  }, [])

const SPECIES_EMOJI: Record<PetSpecies, string> = { DOG: '🐶', CAT: '🐱', OTHER: '🐾' }
export const speciesEmoji = (species: PetSpecies) => SPECIES_EMOJI[species]
