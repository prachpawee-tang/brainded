import { z } from 'zod'

// Isomorphic: used by the API (authoritative) and the app forms (instant feedback).
// Messages are error CODES; the app translates them via `pets:validation.<CODE>`.

export const PET_SPECIES = ['DOG', 'CAT', 'OTHER'] as const
export const PET_SEXES = ['MALE', 'FEMALE', 'UNKNOWN'] as const
export const PET_NOTE_TYPES = ['GENERAL', 'VET_VISIT', 'VACCINE', 'GROOMING'] as const

export type PetSpecies = (typeof PET_SPECIES)[number]
export type PetSex = (typeof PET_SEXES)[number]
export type PetNoteType = (typeof PET_NOTE_TYPES)[number]

export const MIN_WEIGHT_KG = 0.1
export const MAX_WEIGHT_KG = 200
const GRAMS_PER_KG = 1000
/** One day of slack: "today" in Bangkok can be "tomorrow" relative to UTC servers. */
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000

const isNotFuture = (isoDate: string) =>
  new Date(isoDate).getTime() <= Date.now() + FUTURE_TOLERANCE_MS

const localDate = z.iso.date('INVALID_DATE').refine(isNotFuture, 'IN_FUTURE')
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, 'TOO_LONG')
    .transform((value) => value || null)
    .nullish()

export const petInputSchema = z
  .object({
    name: z.string().trim().min(1, 'REQUIRED').max(60, 'TOO_LONG'),
    species: z.enum(PET_SPECIES, 'INVALID'),
    speciesOther: optionalText(40),
    breed: optionalText(60),
    sex: z.enum(PET_SEXES, 'INVALID').default('UNKNOWN'),
    birthDate: localDate.nullish(),
    photoKey: z.string().nullish(),
    notes: optionalText(1000),
  })
  .superRefine((pet, ctx) => {
    if (pet.species === 'OTHER' && !pet.speciesOther) {
      ctx.addIssue({ code: 'custom', path: ['speciesOther'], message: 'REQUIRED' })
    }
  })

export const petWeightInputSchema = z.object({
  weightKg: z.number('INVALID').min(MIN_WEIGHT_KG, 'TOO_SMALL').max(MAX_WEIGHT_KG, 'TOO_BIG'),
  measuredOn: localDate,
  note: optionalText(500),
})

export const petNoteInputSchema = z.object({
  type: z.enum(PET_NOTE_TYPES, 'INVALID'),
  body: z.string().trim().min(1, 'REQUIRED').max(2000, 'TOO_LONG'),
  occurredOn: localDate,
})

export type PetInput = z.infer<typeof petInputSchema>
export type PetWeightInput = z.infer<typeof petWeightInputSchema>
export type PetNoteInput = z.infer<typeof petNoteInputSchema>

export const kgToGrams = (kg: number): number => Math.round(kg * GRAMS_PER_KG)
export const gramsToKg = (grams: number): number => grams / GRAMS_PER_KG

export type ValidationIssue = { path: (string | number)[]; code: string }

export const toValidationIssues = (error: z.ZodError | undefined): ValidationIssue[] =>
  (error?.issues ?? []).map((issue) => ({
    path: issue.path.map((p) => (typeof p === 'symbol' ? String(p) : p)),
    code: issue.message,
  }))
