import { z } from 'zod'
import { COMBINATION_COUNT, findColor } from './palette'

// Isomorphic: used by the API (authoritative) and the app. Messages are error CODES,
// translated by the app via `colors:validation.<CODE>`.

export const FAVORITE_KINDS = ['COLOR', 'COMBINATION'] as const
export type FavoriteKind = (typeof FAVORITE_KINDS)[number]

const isCombinationNumber = (ref: string) => {
  const n = Number(ref)
  return /^\d+$/.test(ref) && n >= 1 && n <= COMBINATION_COUNT
}

/** `ref` is a color slug or a combination number (as text); both must exist in the bundled book. */
export const favoriteInputSchema = z
  .object({
    kind: z.enum(FAVORITE_KINDS, 'INVALID'),
    ref: z.string().trim(),
    isFavorite: z.boolean('INVALID'),
  })
  .superRefine((input, ctx) => {
    const isKnown =
      input.kind === 'COLOR' ? Boolean(findColor(input.ref)) : isCombinationNumber(input.ref)
    if (!isKnown) ctx.addIssue({ code: 'custom', path: ['ref'], message: 'UNKNOWN_REF' })
  })

export type FavoriteInput = z.infer<typeof favoriteInputSchema>

export type ValidationIssue = { path: (string | number)[]; code: string }

export const toValidationIssues = (error: z.ZodError | undefined): ValidationIssue[] =>
  (error?.issues ?? []).map((issue) => ({
    path: issue.path.map((p) => (typeof p === 'symbol' ? String(p) : p)),
    code: issue.message,
  }))
