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
