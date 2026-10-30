import { findLabTest } from '../../../../shared/lab-catalog'
import {
  groupBySection,
  newLabRow,
  patchRow,
  rowFromTest,
  rowFromValue,
  toLabValues,
} from './lab-form'

describe('lab form', () => {
  it('starts a catalog row with its section, code, short name and canonical unit', () => {
    const crea = findLabTest('CREA')
    const parasite = findLabTest('BLOOD_PARASITE')
    if (!crea || !parasite) throw new Error('catalog')
    expect(rowFromTest(crea)).toMatchObject({
      section: 'CHEMISTRY',
      code: 'CREA',
      name: 'CREA',
      unit: 'mg/dL',
    })
    expect(rowFromTest(parasite)).toMatchObject({
      section: 'PARASITE',
      name: 'Blood parasites',
      unit: '',
    })
  })

  it("prefills unit and range from the pet's previous value", () => {
    const alt = findLabTest('ALT')
    if (!alt) throw new Error('catalog')
    expect(rowFromTest(alt, { unit: 'IU/L', refLow: 10, refHigh: 100 })).toMatchObject({
      unit: 'IU/L',
      refLow: '10',
      refHigh: '100',
    })
  })

  it('turns rows into API values: numbers, text answers and ranges', () => {
    const rows = [
      {
        ...newLabRow({ section: 'CBC', code: 'WBC', name: 'WBC' }),
        value: '12,200',
        unit: 'cells/µL',
      },
      {
        ...newLabRow({ section: 'PARASITE', code: 'BLOOD_PARASITE', name: 'Blood parasites' }),
        value: 'Not Found',
      },
      { ...newLabRow({ name: 'Ketone' }), value: '0,5', refLow: '0', refHigh: '1,5' },
      newLabRow({ name: 'Empty' }),
    ]
    expect(toLabValues(rows)).toEqual([
      {
        section: 'CBC',
        code: 'WBC',
        name: 'WBC',
        value: 12200,
        textValue: null,
        unit: 'cells/µL',
        refLow: null,
        refHigh: null,
      },
      {
        section: 'PARASITE',
        code: 'BLOOD_PARASITE',
        name: 'Blood parasites',
        value: null,
        textValue: 'Not Found',
        unit: null,
        refLow: null,
        refHigh: null,
      },
      {
        section: 'OTHER',
        code: null,
        name: 'Ketone',
        value: 0.5,
        textValue: null,
        unit: null,
        refLow: 0,
        refHigh: 1.5,
      },
      {
        section: 'OTHER',
        code: null,
        name: 'Empty',
        value: null,
        textValue: null,
        unit: null,
        refLow: null,
        refHigh: null,
      },
    ])
  })

  it('round-trips a saved value for editing', () => {
    const row = rowFromValue({
      section: 'CHEMISTRY',
      code: 'CREA',
      name: 'CREA',
      value: 1.4,
      textValue: null,
      unit: 'mg/dL',
      refLow: 0.8,
      refHigh: null,
    })
    expect(row).toMatchObject({ value: '1.4', refLow: '0.8', refHigh: '' })
    expect(
      rowFromValue({ section: 'PARASITE', code: 'X', name: 'X', value: null, textValue: '1+' })
        .value,
    ).toBe('1+')
  })

  it('groups by section in report order, keeping each row index', () => {
    const groups = groupBySection([
      { section: 'CHEMISTRY' },
      { section: 'CBC' },
      { section: 'CHEMISTRY' },
    ])
    expect(groups.map((g) => [g.section, g.items.map((i) => i.index)])).toEqual([
      ['CBC', [1]],
      ['CHEMISTRY', [0, 2]],
    ])
  })
})

describe('changing a unit', () => {
  const wbc = () => {
    const test = findLabTest('WBC')
    if (!test) throw new Error('catalog')
    return rowFromTest(test, { unit: 'cells/µL', refLow: 5500, refHigh: 19500 })
  }

  it('converts a prefilled range once the new unit is recognised', () => {
    let row = wbc()
    for (const unit of ['', '×10³', '×10³ cell/mm³']) row = { ...row, ...patchRow(row, { unit }) }
    expect(row).toMatchObject({ unit: '×10³ cell/mm³', refLow: '5.5', refHigh: '19.5' })
  })

  it('leaves the range alone for units it cannot convert, and after a manual range edit', () => {
    expect(patchRow(wbc(), { unit: '%' })).toEqual({ unit: '%' })
    const edited = { ...wbc(), ...patchRow(wbc(), { refLow: '4' }) }
    expect(patchRow(edited, { unit: '×10³/µL' })).toEqual({ unit: '×10³/µL' })
  })
})
