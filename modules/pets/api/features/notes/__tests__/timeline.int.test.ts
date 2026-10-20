import { describe, expect, it } from 'vitest'
import { createPet, createPetsHarness } from '../../../test/pets-harness'

const NOTE = `mutation ($input: AddPetNoteInput!) {
  addPetNote(input: $input) { __typename ... on ValidationError { issues { path code } } ... on Error { code } }
}`
const LOG = `mutation ($input: LogPetWeightInput!) { logPetWeight(input: $input) { __typename } }`
const TIMELINE = `query ($id: ID!, $first: Int, $after: String) {
  pet(id: $id) {
    timeline(first: $first, after: $after) {
      edges { node { kind occurredOn body weightGrams } }
      pageInfo { hasNextPage endCursor }
    }
  }
}`

describe('pet timeline', () => {
  it('merges notes and weights, newest first, paginated', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    await run(NOTE, {
      input: { petId, type: 'VET_VISIT', body: 'ตรวจสุขภาพประจำปี', occurredOn: '2026-01-10' },
    })
    await run(LOG, { input: { petId, weightKg: 4.2, measuredOn: '2026-02-01' } })
    await run(NOTE, {
      input: { petId, type: 'VACCINE', body: 'วัคซีนรวม', occurredOn: '2026-03-05' },
    })

    const page1 = await run(TIMELINE, { id: petId, first: 2 })
    expect(page1.data?.pet.timeline.edges.map((e: { node: unknown }) => e.node)).toEqual([
      { kind: 'NOTE_VACCINE', occurredOn: '2026-03-05', body: 'วัคซีนรวม', weightGrams: null },
      { kind: 'WEIGHT', occurredOn: '2026-02-01', body: null, weightGrams: 4200 },
    ])
    expect(page1.data?.pet.timeline.pageInfo.hasNextPage).toBe(true)

    const page2 = await run(TIMELINE, {
      id: petId,
      first: 2,
      after: page1.data?.pet.timeline.pageInfo.endCursor,
    })
    expect(
      page2.data?.pet.timeline.edges.map((e: { node: { kind: string } }) => e.node.kind),
    ).toEqual(['NOTE_VET_VISIT'])
    expect(page2.data?.pet.timeline.pageInfo.hasNextPage).toBe(false)
  })

  it('validates notes', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    const res = await run(NOTE, {
      input: { petId, type: 'GENERAL', body: '  ', occurredOn: '2026-01-01' },
    })
    expect(res.data?.addPetNote).toEqual({
      __typename: 'ValidationError',
      code: 'VALIDATION_FAILED',
      issues: [{ path: ['body'], code: 'REQUIRED' }],
    })
  })

  it("can't add notes to another user's pet", async () => {
    const { run, bob } = await createPetsHarness()
    const petId = await createPet(run)
    const res = await run(
      NOTE,
      { input: { petId, type: 'GENERAL', body: 'x', occurredOn: '2026-01-01' } },
      bob,
    )
    expect(res.data?.addPetNote).toEqual({ __typename: 'NotFoundError', code: 'PET_NOT_FOUND' })
  })
})

describe('relay node + bad cursors', () => {
  it('resolves a pet through Query.node and ignores malformed timeline cursors', async () => {
    const { run, bob } = await createPetsHarness()
    const petId = await createPet(run)
    const NODE = `query ($id: ID!) { node(id: $id) { __typename ... on Pet { name createdAt latestWeight { id } } } }`
    expect((await run(NODE, { id: petId })).data?.node).toMatchObject({
      __typename: 'Pet',
      name: 'Mango',
      latestWeight: null,
    })
    expect((await run(NODE, { id: petId }, null)).data?.node).toBeNull()
    expect((await run(NODE, { id: petId }, bob)).data?.node).toBeNull()

    const res = await run(TIMELINE, { id: petId, after: 'garbage' })
    expect(res.data?.pet.timeline.edges).toEqual([])
  })
})
