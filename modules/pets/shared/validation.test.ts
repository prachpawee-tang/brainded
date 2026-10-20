import { describe, expect, it } from 'vitest'
import {
  gramsToKg,
  kgToGrams,
  petInputSchema,
  petNoteInputSchema,
  petWeightInputSchema,
  toValidationIssues,
} from './validation'

const TODAY = new Date().toISOString().slice(0, 10)

const issuesOf = (schema: { safeParse: (v: unknown) => { error?: unknown } }, value: unknown) =>
  toValidationIssues(schema.safeParse(value).error as never)

describe('petInputSchema', () => {
  it('accepts the minimum: name + species, defaulting sex to UNKNOWN', () => {
    expect(petInputSchema.parse({ name: '  มะม่วง ', species: 'CAT' })).toMatchObject({
      name: 'มะม่วง',
      species: 'CAT',
      sex: 'UNKNOWN',
    })
  })

  it.each([
    [{ name: '', species: 'DOG' }, [{ path: ['name'], code: 'REQUIRED' }]],
    [{ name: 'x'.repeat(61), species: 'DOG' }, [{ path: ['name'], code: 'TOO_LONG' }]],
    [{ name: 'Bo', species: 'FISH' }, [{ path: ['species'], code: 'INVALID' }]],
    [{ name: 'Bo', species: 'OTHER' }, [{ path: ['speciesOther'], code: 'REQUIRED' }]],
    [
      { name: 'Bo', species: 'DOG', birthDate: '2999-01-01' },
      [{ path: ['birthDate'], code: 'IN_FUTURE' }],
    ],
    [
      { name: 'Bo', species: 'DOG', birthDate: '01/02/2020' },
      [{ path: ['birthDate'], code: 'INVALID_DATE' }],
    ],
  ])('reports %j as %j', (input, issues) => {
    expect(issuesOf(petInputSchema, input)).toEqual(issues)
  })

  it('accepts OTHER with a species name', () => {
    expect(
      petInputSchema.safeParse({ name: 'Bo', species: 'OTHER', speciesOther: 'กระต่าย' }).success,
    ).toBe(true)
  })
})

describe('petWeightInputSchema', () => {
  it('accepts 0.1–200 kg dated up to today', () => {
    expect(petWeightInputSchema.safeParse({ weightKg: 4.2, measuredOn: TODAY }).success).toBe(true)
  })

  it.each([
    [0.05, 'TOO_SMALL'],
    [201, 'TOO_BIG'],
  ])('rejects %d kg with %s', (weightKg, code) => {
    expect(issuesOf(petWeightInputSchema, { weightKg, measuredOn: TODAY })).toEqual([
      { path: ['weightKg'], code },
    ])
  })
})

describe('petNoteInputSchema', () => {
  it('requires a body and a known type', () => {
    expect(issuesOf(petNoteInputSchema, { type: 'PARTY', body: ' ', occurredOn: TODAY })).toEqual([
      { path: ['type'], code: 'INVALID' },
      { path: ['body'], code: 'REQUIRED' },
    ])
  })
})

describe('kg/grams', () => {
  it('converts without float noise', () => {
    expect(kgToGrams(4.2)).toBe(4200)
    expect(gramsToKg(4250)).toBe(4.25)
  })
})

describe('toValidationIssues', () => {
  it('returns no issues without an error', () => {
    expect(toValidationIssues(undefined)).toEqual([])
  })
})
