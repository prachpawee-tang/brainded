import { LAB_SECTIONS, type LabFlag, type LabSection, labFlag } from './health'

export { LAB_SECTIONS, type LabSection }

// Vet-result test catalog (Phase 4): names vets use (incl. Thai), sections, canonical units and
// unit conversions. Deliberately NO reference ranges: they vary by lab/analyser, so ranges always
// come from the report (and are prefilled from the pet's previous value of the same test).

type NumericTest = {
  kind: 'NUMERIC'
  /** Canonical unit; values in an alias unit are multiplied by its factor. */
  unit: string
  aliases?: Record<string, number>
}
type QualitativeTest = {
  kind: 'QUALITATIVE'
  normal: readonly string[]
  abnormal: readonly string[]
}
export type LabTest = { code: string; section: LabSection; en: string; th: readonly string[] } & (
  | NumericTest
  | QualitativeTest
)

const CELLS_E3 = {
  '×10³/µL': 1,
  '×10³ cell/mm³': 1,
  'K/µL': 1,
  '×10⁹/L': 1,
  'cells/µL': 0.001,
  'cell/mm³': 0.001,
}
const G_PER_DL = { 'g/L': 0.1 }
const U_PER_L = { 'IU/L': 1 }
const GRADES = ['1+', '2+', '3+', '4+']
const ABSENT = ['Not Found', 'Negative', 'None', 'Normal']
const MORPHOLOGY = { normal: ABSENT, abnormal: [...GRADES, 'Moderate', 'Marked', 'Many'] }
const PARASITE = { normal: ABSENT, abnormal: ['Found', 'Positive', 'Few', 'Many', ...GRADES] }

const numeric = (unit: string, aliases?: Record<string, number>) => ({
  kind: 'NUMERIC' as const,
  unit,
  aliases,
})
const qualitative = (answers: { normal: readonly string[]; abnormal: readonly string[] }) => ({
  kind: 'QUALITATIVE' as const,
  ...answers,
})

export const LAB_CATALOG: readonly LabTest[] = [
  // CBC
  {
    code: 'RBC',
    section: 'CBC',
    en: 'Red blood cells',
    th: ['จำนวนเม็ดเลือดแดง'],
    ...numeric('×10⁶/µL', { '×10¹²/L': 1, 'M/µL': 1, 'cells/µL': 1e-6 }),
  },
  { code: 'HGB', section: 'CBC', en: 'Hemoglobin', th: ['ฮีโมโกลบิน'], ...numeric('g/dL', G_PER_DL) },
  {
    code: 'HCT',
    section: 'CBC',
    en: 'Hematocrit',
    th: ['เม็ดเลือดแดง', 'ความเข้มข้นเลือด', 'ฮีมาโตคริต'],
    ...numeric('%', { 'L/L': 100 }),
  },
  { code: 'MCV', section: 'CBC', en: 'Mean cell volume', th: [], ...numeric('fL') },
  { code: 'MCH', section: 'CBC', en: 'Mean cell hemoglobin', th: [], ...numeric('pg') },
  {
    code: 'MCHC',
    section: 'CBC',
    en: 'Mean cell hemoglobin concentration',
    th: [],
    ...numeric('g/dL', G_PER_DL),
  },
  {
    code: 'WBC',
    section: 'CBC',
    en: 'White blood cells',
    th: ['เม็ดเลือดขาว'],
    ...numeric('×10³/µL', CELLS_E3),
  },
  {
    code: 'NEU',
    section: 'CBC',
    en: 'Neutrophils',
    th: ['นิวโทรฟิล'],
    ...numeric('×10³/µL', CELLS_E3),
  },
  {
    code: 'LYM',
    section: 'CBC',
    en: 'Lymphocytes',
    th: ['ลิมโฟไซต์'],
    ...numeric('×10³/µL', CELLS_E3),
  },
  {
    code: 'MONO',
    section: 'CBC',
    en: 'Monocytes',
    th: ['โมโนไซต์'],
    ...numeric('×10³/µL', CELLS_E3),
  },
  {
    code: 'EOS',
    section: 'CBC',
    en: 'Eosinophils',
    th: ['อีโอซิโนฟิล'],
    ...numeric('×10³/µL', CELLS_E3),
  },
  {
    code: 'BASO',
    section: 'CBC',
    en: 'Basophils',
    th: ['เบโซฟิล'],
    ...numeric('×10³/µL', CELLS_E3),
  },
  {
    code: 'PLT',
    section: 'CBC',
    en: 'Platelets',
    th: ['เกล็ดเลือด'],
    ...numeric('×10³/µL', CELLS_E3),
  },
  // Blood morphology
  { code: 'ANISO', section: 'MORPHOLOGY', en: 'Anisocytosis', th: [], ...qualitative(MORPHOLOGY) },
  { code: 'POLY', section: 'MORPHOLOGY', en: 'Polychromasia', th: [], ...qualitative(MORPHOLOGY) },
  { code: 'POIK', section: 'MORPHOLOGY', en: 'Poikilocytosis', th: [], ...qualitative(MORPHOLOGY) },
  {
    code: 'PLT_CLUMP',
    section: 'MORPHOLOGY',
    en: 'Platelet clumping',
    th: ['เกล็ดเลือดจับกลุ่ม'],
    ...qualitative(MORPHOLOGY),
  },
  // Blood parasites
  {
    code: 'BLOOD_PARASITE',
    section: 'PARASITE',
    en: 'Blood parasites',
    th: ['พยาธิในเลือด', 'เชื้อในเลือด'],
    ...qualitative(PARASITE),
  },
  {
    code: 'MYCOPLASMA',
    section: 'PARASITE',
    en: 'Mycoplasma (Hemobartonella)',
    th: ['ฮีโมบาร์โทเนลลา'],
    ...qualitative(PARASITE),
  },
  { code: 'BABESIA', section: 'PARASITE', en: 'Babesia', th: ['บาบีเซีย'], ...qualitative(PARASITE) },
  {
    code: 'EHRLICHIA',
    section: 'PARASITE',
    en: 'Ehrlichia',
    th: ['เออร์ลิเคีย'],
    ...qualitative(PARASITE),
  },
  { code: 'HEPATOZOON', section: 'PARASITE', en: 'Hepatozoon', th: [], ...qualitative(PARASITE) },
  // Blood chemistry
  {
    code: 'BUN',
    section: 'CHEMISTRY',
    en: 'Blood urea nitrogen',
    th: ['ค่าของเสียในเลือด', 'ยูเรีย'],
    ...numeric('mg/dL', { 'mmol/L': 2.8 }),
  },
  {
    code: 'CREA',
    section: 'CHEMISTRY',
    en: 'Creatinine',
    th: ['ค่าไต', 'ครีเอตินิน'],
    ...numeric('mg/dL', { 'µmol/L': 1 / 88.4 }),
  },
  { code: 'SDMA', section: 'CHEMISTRY', en: 'SDMA', th: [], ...numeric('µg/dL') },
  { code: 'ALT', section: 'CHEMISTRY', en: 'ALT (SGPT)', th: ['ค่าตับ'], ...numeric('U/L', U_PER_L) },
  { code: 'AST', section: 'CHEMISTRY', en: 'AST (SGOT)', th: [], ...numeric('U/L', U_PER_L) },
  {
    code: 'ALP',
    section: 'CHEMISTRY',
    en: 'Alkaline phosphatase',
    th: ['ค่าถุงน้ำดี'],
    ...numeric('U/L', U_PER_L),
  },
  { code: 'GGT', section: 'CHEMISTRY', en: 'GGT', th: [], ...numeric('U/L', U_PER_L) },
  {
    code: 'TBIL',
    section: 'CHEMISTRY',
    en: 'Total bilirubin',
    th: ['บิลิรูบิน'],
    ...numeric('mg/dL', { 'µmol/L': 1 / 17.1 }),
  },
  {
    code: 'GLU',
    section: 'CHEMISTRY',
    en: 'Glucose',
    th: ['น้ำตาลในเลือด'],
    ...numeric('mg/dL', { 'mmol/L': 18.016 }),
  },
  {
    code: 'TP',
    section: 'CHEMISTRY',
    en: 'Total protein',
    th: ['โปรตีนรวม'],
    ...numeric('g/dL', G_PER_DL),
  },
  { code: 'ALB', section: 'CHEMISTRY', en: 'Albumin', th: ['อัลบูมิน'], ...numeric('g/dL', G_PER_DL) },
  {
    code: 'GLOB',
    section: 'CHEMISTRY',
    en: 'Globulin',
    th: ['โกลบูลิน'],
    ...numeric('g/dL', G_PER_DL),
  },
  {
    code: 'CHOL',
    section: 'CHEMISTRY',
    en: 'Cholesterol',
    th: ['คอเลสเตอรอล'],
    ...numeric('mg/dL', { 'mmol/L': 38.67 }),
  },
  {
    code: 'PHOS',
    section: 'CHEMISTRY',
    en: 'Phosphorus',
    th: ['ฟอสฟอรัส'],
    ...numeric('mg/dL', { 'mmol/L': 3.097 }),
  },
  {
    code: 'CA',
    section: 'CHEMISTRY',
    en: 'Calcium',
    th: ['แคลเซียม'],
    ...numeric('mg/dL', { 'mmol/L': 4.008 }),
  },
  // Urine
  {
    code: 'USG',
    section: 'URINE',
    en: 'Urine specific gravity',
    th: ['ความถ่วงจำเพาะปัสสาวะ'],
    ...numeric(''),
  },
  { code: 'UPH', section: 'URINE', en: 'Urine pH', th: ['ค่า pH ปัสสาวะ'], ...numeric('') },
  {
    code: 'UPRO',
    section: 'URINE',
    en: 'Urine protein',
    th: ['โปรตีนในปัสสาวะ'],
    ...qualitative({ normal: ['Negative'], abnormal: ['Positive', ...GRADES] }),
  },
]

const BY_CODE = new Map(LAB_CATALOG.map((test) => [test.code, test]))
const fold = (text: string) => text.trim().toLowerCase().replace(/\s+/g, ' ')

export const findLabTest = (code: string) => BY_CODE.get(code)

/** Search by code, English or Thai name. Code matches first, then name prefixes, then contains. */
export const searchLabTests = (query: string): LabTest[] => {
  const q = fold(query)
  if (!q) return [...LAB_CATALOG]
  const score = (test: LabTest) => {
    if (fold(test.code) === q) return 0
    const names = [test.code, test.en, ...test.th].map(fold)
    if (names.some((n) => n.startsWith(q))) return 1
    if (names.some((n) => n.includes(q))) return 2
    return -1
  }
  return LAB_CATALOG.map((test) => ({ test, rank: score(test) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank)
    .map(({ test }) => test)
}

/** Code used to group values across results: catalog code, or the custom name upper-cased. */
export const labCodeFor = (name: string) => {
  const q = fold(name)
  const match = LAB_CATALOG.find((test) =>
    [test.code, test.en, ...test.th].some((n) => fold(n) === q),
  )
  return match?.code ?? q.toUpperCase()
}

const THOUSANDS = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/
const DECIMAL_COMMA = /^-?\d+,\d+$/
const PLAIN = /^-?\d+(\.\d+)?$/

/** One input for both kinds: numbers (with `12,200` or `4,5` style commas) or qualitative text. */
export const parseLabInput = (input: string): { value: number } | { textValue: string } | null => {
  const text = input.trim()
  if (!text) return null
  if (THOUSANDS.test(text)) return { value: Number(text.replaceAll(',', '')) }
  if (DECIMAL_COMMA.test(text)) return { value: Number(text.replace(',', '.')) }
  if (PLAIN.test(text)) return { value: Number(text) }
  return { textValue: text }
}

const SUPERSCRIPTS: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁶': '6',
  '⁹': '9',
}
const unitKey = (unit: string) =>
  unit
    .toLowerCase()
    .replace(/[⁰¹²³⁶⁹]/g, (c) => SUPERSCRIPTS[c] ?? c)
    .replace(/[μu](?=[a-z])/g, 'µ')
    .replace(/mm3/g, 'µl')
    .replace(/cells?/g, '')
    .replace(/[\s×x^*]/g, '')

/** Convert to the catalog's canonical unit; null when the test or unit is unknown. */
export const normalizeLabValue = (code: string, value: number, unit: string | null | undefined) => {
  const test = findLabTest(code)
  if (test?.kind !== 'NUMERIC' || unit == null) return null
  const key = unitKey(unit)
  if (key === unitKey(test.unit)) return { value, unit: test.unit }
  const factor = Object.entries(test.aliases ?? {}).find(([alias]) => unitKey(alias) === key)?.[1]
  if (factor === undefined) return null
  return { value: Math.round(value * factor * 1e6) / 1e6, unit: test.unit }
}

/** Numbers against the report's range; qualitative answers against the catalog's known answers. */
export const labValueFlag = (v: {
  code: string
  value?: number | null
  textValue?: string | null
  refLow?: number | null
  refHigh?: number | null
}): LabFlag => {
  if (v.value != null) return labFlag(v.value, v.refLow, v.refHigh)
  const test = findLabTest(v.code)
  if (!v.textValue || test?.kind !== 'QUALITATIVE') return 'UNKNOWN'
  const answer = fold(v.textValue)
  if (test.normal.some((a) => fold(a) === answer)) return 'NORMAL'
  if (test.abnormal.some((a) => fold(a) === answer)) return 'ABNORMAL'
  return 'UNKNOWN'
}
