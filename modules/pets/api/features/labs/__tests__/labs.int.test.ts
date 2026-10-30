import { describe, expect, it } from 'vitest'
import { createPet, createPetsHarness } from '../../../test/pets-harness'

const ADD = `mutation ($input: AddPetLabResultInput!) {
  addPetLabResult(input: $input) {
    __typename
    ... on MutationAddPetLabResultSuccess {
      data { id title takenOn clinic abnormalCount values { name value unit refLow refHigh flag } photos { url } }
    }
    ... on ValidationError { issues { path code } }
    ... on Error { code }
  }
}`
const LIST = `query ($id: ID!) { pet(id: $id) { labResults { title takenOn } timeline { edges { node { kind body } } } } }`
const ONE = `query ($id: ID!, $labId: ID!) { pet(id: $id) { labResult(id: $labId) { title values { name } } } }`
const DELETE = `mutation ($input: DeletePetLabResultInput!) { deletePetLabResult(input: $input) { __typename ... on Error { code } } }`

const blood = (petId: string, extra: Record<string, unknown> = {}) => ({
  input: {
    petId,
    takenOn: '2026-10-01',
    title: 'ตรวจเลือด',
    values: [
      { name: 'ALT', value: 120, unit: 'U/L', refLow: 10, refHigh: 100 },
      { name: 'BUN', value: 20, unit: 'mg/dL', refLow: 7, refHigh: 27 },
      { name: 'Note', value: 1 },
    ],
    ...extra,
  },
})

describe('addPetLabResult', () => {
  it('stores values with computed flags and photos, and adds a timeline event', async () => {
    const { run, alice } = await createPetsHarness()
    const petId = await createPet(run)
    const res = await run(
      ADD,
      blood(petId, { clinic: 'คลินิกใกล้บ้าน', photoKeys: [`${alice}/uploads/r.jpg`] }),
    )
    expect(res.data?.addPetLabResult).toMatchObject({
      __typename: 'MutationAddPetLabResultSuccess',
      data: {
        title: 'ตรวจเลือด',
        clinic: 'คลินิกใกล้บ้าน',
        abnormalCount: 1,
        values: [
          { name: 'ALT', value: 120, flag: 'HIGH' },
          { name: 'BUN', value: 20, flag: 'NORMAL' },
          { name: 'Note', value: 1, flag: 'UNKNOWN', refLow: null },
        ],
        photos: [{ url: `memory://${alice}/uploads/r.jpg` }],
      },
    })
    const list = await run(LIST, { id: petId })
    expect(list.data?.pet.labResults).toEqual([{ title: 'ตรวจเลือด', takenOn: '2026-10-01' }])
    expect(list.data?.pet.timeline.edges[0].node).toEqual({ kind: 'LAB_RESULT', body: 'ตรวจเลือด' })
  })

  it('validates input and photo ownership', async () => {
    const { run, bob } = await createPetsHarness()
    const petId = await createPet(run)
    const invalid = await run(ADD, blood(petId, { title: '' }))
    expect(invalid.data?.addPetLabResult.issues).toEqual([{ path: ['title'], code: 'REQUIRED' }])
    const stolen = await run(ADD, blood(petId, { photoKeys: [`${bob}/uploads/x.jpg`] }))
    expect(stolen.data?.addPetLabResult).toEqual({
      __typename: 'ForbiddenError',
      code: 'PHOTO_NOT_OWNED',
    })
  })

  it("can't add to another user's pet", async () => {
    const { run, bob } = await createPetsHarness()
    const petId = await createPet(run)
    expect((await run(ADD, blood(petId), bob)).data?.addPetLabResult).toEqual({
      __typename: 'NotFoundError',
      code: 'PET_NOT_FOUND',
    })
  })
})

describe('labResult / deletePetLabResult', () => {
  it('reads one result and deletes it (owner only)', async () => {
    const { run, bob } = await createPetsHarness()
    const petId = await createPet(run)
    const labId = (await run(ADD, blood(petId))).data?.addPetLabResult.data.id
    expect((await run(ONE, { id: petId, labId })).data?.pet.labResult.values).toHaveLength(3)
    expect((await run(DELETE, { input: { id: labId } }, bob)).data?.deletePetLabResult).toEqual({
      __typename: 'NotFoundError',
      code: 'LAB_RESULT_NOT_FOUND',
    })
    expect((await run(DELETE, { input: { id: labId } })).data?.deletePetLabResult.__typename).toBe(
      'MutationDeletePetLabResultSuccess',
    )
    expect((await run(ONE, { id: petId, labId })).data?.pet.labResult).toBeNull()
    expect((await run(ONE, { id: petId, labId: 'not-a-uuid' })).data?.pet.labResult).toBeNull()
  })
})

const ADD_V2 = `mutation ($input: AddPetLabResultInput!) {
  addPetLabResult(input: $input) {
    __typename
    ... on MutationAddPetLabResultSuccess {
      data {
        id remark interpretation abnormalCount
        values { section code name value textValue unit flag }
        photos { key }
      }
    }
    ... on ValidationError { issues { path code } }
    ... on Error { code }
  }
}`
const UPDATE = `mutation ($input: UpdatePetLabResultInput!) {
  updatePetLabResult(input: $input) {
    __typename
    ... on MutationUpdatePetLabResultSuccess {
      data { id title remark values { name value } photos { key } }
    }
    ... on ValidationError { issues { path code } }
    ... on Error { code }
  }
}`
const TREND = `query ($id: ID!, $code: String!) {
  pet(id: $id) { labTrend(code: $code) { takenOn labResultId value textValue unit refLow refHigh flag } }
}`

const report = (petId: string, extra: Record<string, unknown> = {}) => ({
  input: {
    petId,
    takenOn: '2026-10-01',
    title: 'CBC + chemistry',
    remark: 'Mild hemolysis',
    interpretation: 'ค่าไตปกติ ค่าตับสูงเล็กน้อย',
    values: [
      { section: 'CBC', name: 'WBC', value: 12200, unit: 'cells/µL' },
      { section: 'PARASITE', name: 'Blood parasites', textValue: 'Positive' },
      { section: 'CHEMISTRY', name: 'ค่าไต', value: 1.4, unit: 'mg/dL', refLow: 0.8, refHigh: 1.8 },
    ],
    ...extra,
  },
})

describe('vet results v2', () => {
  it('stores sections, catalog codes, qualitative values, remark and interpretation', async () => {
    const { run, alice } = await createPetsHarness()
    const petId = await createPet(run)
    const res = await run(ADD_V2, report(petId, { photoKeys: [`${alice}/uploads/a.jpg`] }))
    expect(res.data?.addPetLabResult.data).toMatchObject({
      remark: 'Mild hemolysis',
      interpretation: 'ค่าไตปกติ ค่าตับสูงเล็กน้อย',
      abnormalCount: 1,
      values: [
        { section: 'CBC', code: 'WBC', value: 12200, textValue: null, flag: 'UNKNOWN' },
        {
          section: 'PARASITE',
          code: 'BLOOD_PARASITE',
          value: null,
          textValue: 'Positive',
          flag: 'ABNORMAL',
        },
        { section: 'CHEMISTRY', code: 'CREA', value: 1.4, flag: 'NORMAL' },
      ],
      photos: [{ key: `${alice}/uploads/a.jpg` }],
    })
  })

  it('needs exactly one of a number or a text answer per value', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    const res = await run(ADD_V2, report(petId, { values: [{ name: 'ALT' }] }))
    expect(res.data?.addPetLabResult.issues).toEqual([
      { path: ['values', '0', 'value'], code: 'REQUIRED' },
    ])
    const both = await run(
      ADD_V2,
      report(petId, { values: [{ name: 'ALT', value: 1, textValue: 'High' }] }),
    )
    expect(both.data?.addPetLabResult.issues).toEqual([
      { path: ['values', '0', 'value'], code: 'INVALID' },
    ])
  })

  it('edits a result: replaces values and photos (owner only)', async () => {
    const { run, alice, bob } = await createPetsHarness()
    const petId = await createPet(run)
    const id = (await run(ADD_V2, report(petId, { photoKeys: [`${alice}/uploads/a.jpg`] }))).data
      ?.addPetLabResult.data.id
    const input = {
      id,
      takenOn: '2026-10-02',
      title: 'Edited',
      values: [{ name: 'ALT', value: 80 }],
      photoKeys: [`${alice}/uploads/b.jpg`],
    }
    expect((await run(UPDATE, { input }, bob)).data?.updatePetLabResult).toEqual({
      __typename: 'NotFoundError',
      code: 'LAB_RESULT_NOT_FOUND',
    })
    expect((await run(UPDATE, { input })).data?.updatePetLabResult.data).toEqual({
      id,
      title: 'Edited',
      remark: null,
      values: [{ name: 'ALT', value: 80 }],
      photos: [{ key: `${alice}/uploads/b.jpg` }],
    })
    const stolen = await run(UPDATE, { input: { ...input, photoKeys: [`${bob}/uploads/x.jpg`] } })
    expect(stolen.data?.updatePetLabResult.code).toBe('PHOTO_NOT_OWNED')
  })

  it('returns one test across results, oldest first, with each result date', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    await run(ADD_V2, report(petId, { takenOn: '2026-10-01' }))
    await run(
      ADD_V2,
      report(petId, {
        takenOn: '2026-06-01',
        values: [{ name: 'Creatinine', value: 1.1, unit: 'mg/dL' }],
      }),
    )
    const res = await run(TREND, { id: petId, code: 'CREA' })
    expect(
      res.data?.pet.labTrend.map((v: { takenOn: string; value: number }) => [v.takenOn, v.value]),
    ).toEqual([
      ['2026-06-01', 1.1],
      ['2026-10-01', 1.4],
    ])
    expect(res.data?.pet.labTrend[1]).toMatchObject({ refLow: 0.8, refHigh: 1.8, flag: 'NORMAL' })
  })
})
