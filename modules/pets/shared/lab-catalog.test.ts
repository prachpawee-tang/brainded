import { describe, expect, it } from 'vitest'
import {
  findLabTest,
  LAB_CATALOG,
  LAB_SECTIONS,
  labCodeFor,
  labValueFlag,
  normalizeLabValue,
  parseLabInput,
  searchLabTests,
} from './lab-catalog'

describe('LAB_CATALOG', () => {
  it('has unique codes, a known section and a unit for every numeric test', () => {
    const codes = LAB_CATALOG.map((t) => t.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const test of LAB_CATALOG) {
      expect(LAB_SECTIONS).toContain(test.section)
      if (test.kind === 'NUMERIC') expect(test.unit).toBeDefined()
    }
  })

  it('ships no reference ranges (they come from the report)', () => {
    for (const test of LAB_CATALOG) expect(test).not.toHaveProperty('refLow')
  })
})

describe('searchLabTests', () => {
  it.each([
    ['ค่าไต', 'CREA'],
    ['ค่าถุงน้ำดี', 'ALP'],
    ['ค่าของเสีย', 'BUN'],
    ['ค่าตับ', 'ALT'],
    ['เม็ดเลือดขาว', 'WBC'],
    ['crea', 'CREA'],
    ['white blood', 'WBC'],
  ])('finds %s → %s', (query, code) => {
    expect(searchLabTests(query)[0]?.code).toBe(code)
  })

  it('ranks code matches first and returns everything for an empty query', () => {
    expect(searchLabTests('ALT')[0]?.code).toBe('ALT')
    expect(searchLabTests('  ')).toHaveLength(LAB_CATALOG.length)
  })
})

describe('labCodeFor', () => {
  it('maps catalog names to their code and anything else to its upper-cased name', () => {
    expect(labCodeFor('Creatinine')).toBe('CREA')
    expect(labCodeFor('ค่าไต')).toBe('CREA')
    expect(labCodeFor(' crea ')).toBe('CREA')
    expect(labCodeFor('  Fancy  test ')).toBe('FANCY TEST')
  })
})

describe('parseLabInput', () => {
  it.each([
    ['12,200', { value: 12200 }],
    ['1,234.5', { value: 1234.5 }],
    ['1,234,567', { value: 1234567 }],
    ['4,5', { value: 4.5 }],
    ['0.82', { value: 0.82 }],
    ['-1.5', { value: -1.5 }],
    [' 7 ', { value: 7 }],
    ['1+', { textValue: '1+' }],
    ['Not Found', { textValue: 'Not Found' }],
    ['12,20,0', { textValue: '12,20,0' }],
  ] as const)('%s', (input, expected) => {
    expect(parseLabInput(input)).toEqual(expected)
  })

  it('returns null for blank input', () => {
    expect(parseLabInput('   ')).toBeNull()
  })
})

describe('normalizeLabValue', () => {
  it('treats 12,200 cells/µL and 12.2 ×10³ cell/mm³ as the same WBC', () => {
    expect(normalizeLabValue('WBC', 12200, 'cells/µL')).toEqual({ value: 12.2, unit: '×10³/µL' })
    expect(normalizeLabValue('WBC', 12.2, '×10³ cell/mm³')).toEqual({
      value: 12.2,
      unit: '×10³/µL',
    })
    expect(normalizeLabValue('WBC', 12.2, '10^3/uL')).toEqual({ value: 12.2, unit: '×10³/µL' })
  })

  it('converts SI chemistry units', () => {
    expect(normalizeLabValue('CREA', 88.4, 'µmol/L')?.value).toBeCloseTo(1)
    expect(normalizeLabValue('HCT', 0.35, 'L/L')?.value).toBeCloseTo(35)
  })

  it('keeps the canonical unit and refuses unknown units or tests', () => {
    expect(normalizeLabValue('ALT', 54, 'U/L')).toEqual({ value: 54, unit: 'U/L' })
    expect(normalizeLabValue('ALT', 54, 'IU/L')).toEqual({ value: 54, unit: 'U/L' })
    expect(normalizeLabValue('WBC', 60, '%')).toBeNull()
    expect(normalizeLabValue('FANCY', 1, 'mg')).toBeNull()
    expect(normalizeLabValue('ALT', 54, null)).toBeNull()
  })

  it('looks tests up by code', () => {
    expect(findLabTest('ALP')?.th).toContain('ค่าถุงน้ำดี')
    expect(findLabTest('NOPE')).toBeUndefined()
  })
})

describe('labValueFlag', () => {
  it('flags numbers against the range', () => {
    expect(labValueFlag({ code: 'ALT', value: 120, refLow: 10, refHigh: 100 })).toBe('HIGH')
    expect(labValueFlag({ code: 'ALT', value: 50 })).toBe('UNKNOWN')
  })

  it('flags qualitative answers from the catalog, ignoring case', () => {
    expect(labValueFlag({ code: 'BLOOD_PARASITE', textValue: 'not found' })).toBe('NORMAL')
    expect(labValueFlag({ code: 'BLOOD_PARASITE', textValue: 'Positive' })).toBe('ABNORMAL')
    expect(labValueFlag({ code: 'ANISO', textValue: '2+' })).toBe('ABNORMAL')
    expect(labValueFlag({ code: 'ANISO', textValue: 'Few' })).toBe('UNKNOWN')
    expect(labValueFlag({ code: 'FANCY', textValue: 'Positive' })).toBe('UNKNOWN')
  })
})
