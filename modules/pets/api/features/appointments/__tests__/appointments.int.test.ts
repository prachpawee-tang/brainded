import { describe, expect, it } from 'vitest'
import { createPet, createPetsHarness } from '../../../test/pets-harness'

const ADD = `mutation ($input: AddPetAppointmentInput!) {
  addPetAppointment(input: $input) {
    __typename
    ... on MutationAddPetAppointmentSuccess { data { id scheduledAt reason clinic status } }
    ... on ValidationError { issues { path code } }
    ... on Error { code }
  }
}`
const STATUS = `mutation ($input: SetPetAppointmentStatusInput!) {
  setPetAppointmentStatus(input: $input) { __typename ... on MutationSetPetAppointmentStatusSuccess { data { status } } ... on Error { code } }
}`
const UPDATE = `mutation ($input: UpdatePetAppointmentInput!) {
  updatePetAppointment(input: $input) { __typename ... on MutationUpdatePetAppointmentSuccess { data { reason clinic } } ... on Error { code } }
}`
const VIEW = `query ($id: ID!) { pet(id: $id) {
  nextAppointment { reason }
  appointments { reason status }
  timeline { edges { node { kind body } } }
} }`

const FUTURE = new Date(Date.now() + 3 * 86_400_000).toISOString()
const LATER = new Date(Date.now() + 10 * 86_400_000).toISOString()
const PAST = new Date(Date.now() - 3 * 86_400_000).toISOString()

describe('appointments', () => {
  it('adds appointments and exposes the next upcoming one', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    await run(ADD, { input: { petId, scheduledAt: LATER, reason: 'ตรวจฟัน' } })
    const res = await run(ADD, {
      input: { petId, scheduledAt: FUTURE, reason: 'ฉีดวัคซีน', clinic: 'คลินิก A' },
    })
    await run(ADD, { input: { petId, scheduledAt: PAST, reason: 'ผ่านมาแล้ว' } })
    expect(res.data?.addPetAppointment.data).toMatchObject({
      reason: 'ฉีดวัคซีน',
      clinic: 'คลินิก A',
      status: 'SCHEDULED',
    })
    const view = await run(VIEW, { id: petId })
    expect(view.data?.pet.nextAppointment).toEqual({ reason: 'ฉีดวัคซีน' })
    expect(view.data?.pet.appointments.map((a: { reason: string }) => a.reason)).toEqual([
      'ผ่านมาแล้ว',
      'ฉีดวัคซีน',
      'ตรวจฟัน',
    ])
  })

  it('marks done (timeline) or cancelled; cancelled is no longer next', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    const id = (await run(ADD, { input: { petId, scheduledAt: FUTURE, reason: 'ฉีดวัคซีน' } })).data
      ?.addPetAppointment.data.id
    expect(
      (await run(STATUS, { input: { id, status: 'DONE' } })).data?.setPetAppointmentStatus.data,
    ).toEqual({ status: 'DONE' })
    const view = await run(VIEW, { id: petId })
    expect(view.data?.pet.nextAppointment).toBeNull()
    expect(view.data?.pet.timeline.edges[0].node).toEqual({
      kind: 'APPOINTMENT_DONE',
      body: 'ฉีดวัคซีน',
    })
  })

  it('updates, validates and scopes to owner', async () => {
    const { run, bob } = await createPetsHarness()
    const petId = await createPet(run)
    const id = (await run(ADD, { input: { petId, scheduledAt: FUTURE, reason: 'ฉีดวัคซีน' } })).data
      ?.addPetAppointment.data.id
    expect(
      (await run(UPDATE, { input: { id, scheduledAt: FUTURE, reason: 'ฉีดวัคซีนรวม', clinic: 'B' } }))
        .data?.updatePetAppointment.data,
    ).toEqual({ reason: 'ฉีดวัคซีนรวม', clinic: 'B' })
    expect(
      (await run(STATUS, { input: { id, status: 'CANCELLED' } }, bob)).data
        ?.setPetAppointmentStatus,
    ).toEqual({ __typename: 'NotFoundError', code: 'APPOINTMENT_NOT_FOUND' })
    expect(
      (await run(ADD, { input: { petId, scheduledAt: 'tomorrow', reason: '' } })).data
        ?.addPetAppointment.issues,
    ).toEqual([
      { path: ['scheduledAt'], code: 'INVALID_DATE' },
      { path: ['reason'], code: 'REQUIRED' },
    ])
  })
  it("records the done event on the client's local date when given", async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    // 06:00 in Bangkok is still the previous day in UTC.
    const id = (
      await run(ADD, {
        input: { petId, scheduledAt: '2026-11-02T06:00:00+07:00', reason: 'เช้าตรู่' },
      })
    ).data?.addPetAppointment.data.id
    await run(STATUS, { input: { id, status: 'DONE', localDate: '2026-11-02' } })
    const tl = await run(
      `query ($id: ID!) { pet(id: $id) { timeline { edges { node { kind occurredOn } } } } }`,
      { id: petId },
    )
    expect(tl.data?.pet.timeline.edges[0].node).toEqual({
      kind: 'APPOINTMENT_DONE',
      occurredOn: '2026-11-02',
    })
  })
})
