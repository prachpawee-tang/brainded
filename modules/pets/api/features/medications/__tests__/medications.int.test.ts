import { describe, expect, it } from 'vitest'
import { createPet, createPetsHarness } from '../../../test/pets-harness'

const ADD = `mutation ($input: AddPetMedicationInput!) {
  addPetMedication(input: $input) {
    __typename
    ... on MutationAddPetMedicationSuccess { data { id name dosage times everyDays startOn endOn } }
    ... on ValidationError { issues { path code } }
    ... on Error { code }
  }
}`
const UPDATE = `mutation ($input: UpdatePetMedicationInput!) {
  updatePetMedication(input: $input) { __typename ... on MutationUpdatePetMedicationSuccess { data { name times endOn } } ... on Error { code } }
}`
const DOSES = `query ($id: ID!, $date: LocalDate!) { pet(id: $id) { dosesOn(date: $date) { time takenAt medication { name } } medications { name } } }`
const TAKE = `mutation ($input: SetDoseTakenInput!) {
  setDoseTaken(input: $input) { __typename ... on MutationSetDoseTakenSuccess { data { time takenAt } } ... on Error { code } }
}`

const apoquel = (petId: string, extra = {}) => ({
  input: {
    petId,
    name: 'Apoquel',
    dosage: '½ เม็ด',
    times: ['20:00', '08:00'],
    everyDays: 1,
    startOn: '2026-10-01',
    ...extra,
  },
})

describe('medications', () => {
  it('adds a medication and writes a timeline event', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    const res = await run(ADD, apoquel(petId))
    expect(res.data?.addPetMedication.data).toMatchObject({
      name: 'Apoquel',
      times: ['08:00', '20:00'],
      endOn: null,
    })
    const tl = await run(
      `query ($id: ID!) { pet(id: $id) { timeline { edges { node { kind body } } } } }`,
      { id: petId },
    )
    expect(tl.data?.pet.timeline.edges[0].node).toEqual({
      kind: 'MEDICATION_STARTED',
      body: 'Apoquel · ½ เม็ด',
    })
  })

  it('lists doses for a day and toggles taken', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    const medicationId = (await run(ADD, apoquel(petId))).data?.addPetMedication.data.id
    await run(ADD, apoquel(petId, { name: 'Weekly', times: ['09:00'], everyDays: 7 }))

    const day = await run(DOSES, { id: petId, date: '2026-10-02' })
    expect(day.data?.pet.dosesOn).toEqual([
      { time: '08:00', takenAt: null, medication: { name: 'Apoquel' } },
      { time: '20:00', takenAt: null, medication: { name: 'Apoquel' } },
    ])

    const taken = await run(TAKE, {
      input: { medicationId, date: '2026-10-02', time: '08:00', taken: true },
    })
    expect(taken.data?.setDoseTaken.data.takenAt).toEqual(expect.any(String))
    expect(
      (await run(TAKE, { input: { medicationId, date: '2026-10-02', time: '08:00', taken: true } }))
        .data?.setDoseTaken.__typename,
    ).toBe('MutationSetDoseTakenSuccess')
    const undone = await run(TAKE, {
      input: { medicationId, date: '2026-10-02', time: '08:00', taken: false },
    })
    expect(undone.data?.setDoseTaken.data.takenAt).toBeNull()

    const weeklyDay = await run(DOSES, { id: petId, date: '2026-10-08' })
    expect(
      weeklyDay.data?.pet.dosesOn.map((d: { medication: { name: string } }) => d.medication.name),
    ).toEqual(['Apoquel', 'Weekly', 'Apoquel'])
  })

  it('rejects doses that are not on the schedule', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    const medicationId = (await run(ADD, apoquel(petId))).data?.addPetMedication.data.id
    const res = await run(TAKE, {
      input: { medicationId, date: '2026-10-02', time: '12:00', taken: true },
    })
    expect(res.data?.setDoseTaken).toEqual({
      __typename: 'NotFoundError',
      code: 'DOSE_NOT_SCHEDULED',
    })
  })

  it('updates and ends a medication; validates; scopes to owner', async () => {
    const { run, bob } = await createPetsHarness()
    const petId = await createPet(run)
    const id = (await run(ADD, apoquel(petId))).data?.addPetMedication.data.id
    const updated = await run(UPDATE, {
      input: {
        id,
        name: 'Apoquel 16mg',
        times: ['09:00'],
        everyDays: 1,
        startOn: '2026-10-01',
        endOn: '2026-10-10',
      },
    })
    expect(updated.data?.updatePetMedication.data).toEqual({
      name: 'Apoquel 16mg',
      times: ['09:00'],
      endOn: '2026-10-10',
    })
    expect((await run(DOSES, { id: petId, date: '2026-10-11' })).data?.pet.dosesOn).toEqual([])
    expect(
      (
        await run(
          UPDATE,
          { input: { id, name: 'x', times: ['09:00'], everyDays: 1, startOn: '2026-10-01' } },
          bob,
        )
      ).data?.updatePetMedication,
    ).toEqual({ __typename: 'NotFoundError', code: 'MEDICATION_NOT_FOUND' })
    expect((await run(ADD, apoquel(petId, { times: [] }))).data?.addPetMedication.issues).toEqual([
      { path: ['times'], code: 'REQUIRED' },
    ])
  })
})
