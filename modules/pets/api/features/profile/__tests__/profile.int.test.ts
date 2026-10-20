import { describe, expect, it } from 'vitest'
import { CREATE_PET, createPet, createPetsHarness } from '../../../test/pets-harness'

const PETS = `query ($first: Int, $after: String) {
  pets(first: $first, after: $after) { edges { node { name } } pageInfo { hasNextPage endCursor } }
}`
const PET = `query ($id: ID!) { pet(id: $id) { id name species breed notes photoUrl } }`
const UPDATE = `mutation ($input: UpdatePetInput!) {
  updatePet(input: $input) {
    __typename
    ... on MutationUpdatePetSuccess { data { name breed notes birthDate } }
    ... on ValidationError { issues { path code } }
    ... on Error { code }
  }
}`
const ARCHIVE = `mutation ($input: ArchivePetInput!) {
  archivePet(input: $input) { __typename ... on Error { code } }
}`

describe('createPet', () => {
  it('requires sign-in', async () => {
    const { run } = await createPetsHarness()
    const res = await run(CREATE_PET, { input: { name: 'Mango', species: 'CAT' } }, null)
    expect(res.data?.createPet).toEqual({
      __typename: 'UnauthenticatedError',
      code: 'UNAUTHENTICATED',
    })
  })

  it('creates a pet from just a name and species', async () => {
    const { run } = await createPetsHarness()
    const res = await run(CREATE_PET, { input: { name: ' มะม่วง ', species: 'CAT' } })
    expect(res.data?.createPet).toMatchObject({
      __typename: 'MutationCreatePetSuccess',
      data: { name: 'มะม่วง', species: 'CAT', sex: 'UNKNOWN', breed: null, photoUrl: null },
    })
  })

  it('returns validation issues as codes', async () => {
    const { run } = await createPetsHarness()
    const res = await run(CREATE_PET, { input: { name: '', species: 'OTHER' } })
    expect(res.data?.createPet).toEqual({
      __typename: 'ValidationError',
      code: 'VALIDATION_FAILED',
      issues: [
        { path: ['name'], code: 'REQUIRED' },
        { path: ['speciesOther'], code: 'REQUIRED' },
      ],
    })
  })

  it('accepts a photo uploaded by the same user and returns a URL', async () => {
    const { run, alice } = await createPetsHarness()
    const res = await run(CREATE_PET, {
      input: { name: 'Mango', species: 'CAT', photoKey: `${alice}/uploads/a.jpg` },
    })
    expect(res.data?.createPet.data.photoUrl).toBe(`memory://${alice}/uploads/a.jpg`)
  })

  it("rejects another user's photo key", async () => {
    const { run, bob } = await createPetsHarness()
    const res = await run(CREATE_PET, {
      input: { name: 'Mango', species: 'CAT', photoKey: `${bob}/uploads/a.jpg` },
    })
    expect(res.data?.createPet).toEqual({ __typename: 'ForbiddenError', code: 'PHOTO_NOT_OWNED' })
  })
})

describe('pets / pet', () => {
  it("lists only the viewer's pets, oldest first, with pagination", async () => {
    const { run, bob } = await createPetsHarness()
    for (const name of ['A', 'B', 'C']) await createPet(run, { name, species: 'DOG' })
    await createPet(run, { name: 'Bobs', species: 'DOG' }, bob)

    const first = await run(PETS, { first: 2 })
    expect(first.data?.pets.edges.map((e: { node: { name: string } }) => e.node.name)).toEqual([
      'A',
      'B',
    ])
    expect(first.data?.pets.pageInfo.hasNextPage).toBe(true)

    const second = await run(PETS, { first: 2, after: first.data?.pets.pageInfo.endCursor })
    expect(second.data?.pets.edges.map((e: { node: { name: string } }) => e.node.name)).toEqual([
      'C',
    ])
  })

  it("returns null for another user's pet", async () => {
    const { run, bob } = await createPetsHarness()
    const id = await createPet(run)
    expect((await run(PET, { id }, bob)).data).toEqual({ pet: null })
    expect((await run(PET, { id })).data?.pet.name).toBe('Mango')
  })

  it('returns null for malformed ids', async () => {
    const { run } = await createPetsHarness()
    expect((await run(PET, { id: 'garbage' })).data).toEqual({ pet: null })
  })
})

describe('updatePet', () => {
  it('updates only provided fields and clears explicit nulls', async () => {
    const { run } = await createPetsHarness()
    const id = await createPet(run, { name: 'Mango', species: 'CAT', breed: 'Thai', notes: 'แพ้ไก่' })
    const res = await run(UPDATE, {
      input: { id, name: 'Mango Jr', notes: null, birthDate: '2022-05-01' },
    })
    expect(res.data?.updatePet).toEqual({
      __typename: 'MutationUpdatePetSuccess',
      data: { name: 'Mango Jr', breed: 'Thai', notes: null, birthDate: '2022-05-01' },
    })
  })

  it("can't touch another user's pet", async () => {
    const { run, bob } = await createPetsHarness()
    const id = await createPet(run)
    const res = await run(UPDATE, { input: { id, name: 'Stolen' } }, bob)
    expect(res.data?.updatePet).toEqual({ __typename: 'NotFoundError', code: 'PET_NOT_FOUND' })
  })

  it('validates the merged result', async () => {
    const { run } = await createPetsHarness()
    const id = await createPet(run)
    const res = await run(UPDATE, { input: { id, birthDate: '2999-01-01' } })
    expect(res.data?.updatePet).toEqual({
      __typename: 'ValidationError',
      code: 'VALIDATION_FAILED',
      issues: [{ path: ['birthDate'], code: 'IN_FUTURE' }],
    })
  })
})

describe('archivePet', () => {
  it('hides the pet from lists and lookups', async () => {
    const { run } = await createPetsHarness()
    const id = await createPet(run)
    expect((await run(ARCHIVE, { input: { id } })).data?.archivePet.__typename).toBe(
      'MutationArchivePetSuccess',
    )
    expect((await run(PET, { id })).data).toEqual({ pet: null })
    expect((await run(PETS)).data?.pets.edges).toEqual([])
    expect((await run(ARCHIVE, { input: { id } })).data?.archivePet).toEqual({
      __typename: 'NotFoundError',
      code: 'PET_NOT_FOUND',
    })
  })
})
