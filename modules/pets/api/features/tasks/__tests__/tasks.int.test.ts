import { describe, expect, it } from 'vitest'
import { createPet, createPetsHarness } from '../../../test/pets-harness'

const ADD = `mutation ($input: AddPetTaskInput!) {
  addPetTask(input: $input) {
    __typename
    ... on MutationAddPetTaskSuccess { data { id title note dueOn completedAt } }
    ... on ValidationError { issues { path code } }
    ... on Error { code }
  }
}`
const UPDATE = `mutation ($input: UpdatePetTaskInput!) {
  updatePetTask(input: $input) { __typename ... on MutationUpdatePetTaskSuccess { data { title dueOn note } } ... on Error { code } }
}`
const DONE = `mutation ($input: SetPetTaskDoneInput!) {
  setPetTaskDone(input: $input) { __typename ... on MutationSetPetTaskDoneSuccess { data { completedAt } } ... on Error { code } }
}`
const DELETE = `mutation ($input: DeletePetTaskInput!) { deletePetTask(input: $input) { __typename ... on Error { code } } }`
const LIST = `query ($id: ID!, $includeDone: Boolean) { pet(id: $id) { tasks(includeDone: $includeDone) { title } } }`

describe('pet tasks', () => {
  it('adds tasks and lists open ones, soonest first', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    const res = await run(ADD, { input: { petId, title: ' ซื้อยาหยอดเห็บ ', dueOn: '2026-11-10' } })
    expect(res.data?.addPetTask).toMatchObject({
      data: { title: 'ซื้อยาหยอดเห็บ', dueOn: '2026-11-10', note: null, completedAt: null },
    })
    await run(ADD, { input: { petId, title: 'จองตัดขน', dueOn: '2026-11-01' } })
    await run(ADD, { input: { petId, title: 'ไม่มีกำหนด' } })
    const list = await run(LIST, { id: petId })
    expect(list.data?.pet.tasks.map((t: { title: string }) => t.title)).toEqual([
      'จองตัดขน',
      'ซื้อยาหยอดเห็บ',
      'ไม่มีกำหนด',
    ])
  })

  it('marks done, hides it from open tasks, and can reopen', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    const id = (await run(ADD, { input: { petId, title: 'x' } })).data?.addPetTask.data.id
    expect(
      (await run(DONE, { input: { id, done: true } })).data?.setPetTaskDone.data.completedAt,
    ).toEqual(expect.any(String))
    expect((await run(LIST, { id: petId })).data?.pet.tasks).toEqual([])
    expect((await run(LIST, { id: petId, includeDone: true })).data?.pet.tasks).toHaveLength(1)
    expect(
      (await run(DONE, { input: { id, done: false } })).data?.setPetTaskDone.data.completedAt,
    ).toBeNull()
  })

  it('updates, deletes, validates and scopes to the owner', async () => {
    const { run, bob } = await createPetsHarness()
    const petId = await createPet(run)
    const id = (await run(ADD, { input: { petId, title: 'old' } })).data?.addPetTask.data.id
    expect(
      (await run(UPDATE, { input: { id, title: 'new', dueOn: '2026-11-05', note: 'n' } })).data
        ?.updatePetTask.data,
    ).toEqual({ title: 'new', dueOn: '2026-11-05', note: 'n' })
    expect((await run(UPDATE, { input: { id, title: 'x' } }, bob)).data?.updatePetTask).toEqual({
      __typename: 'NotFoundError',
      code: 'TASK_NOT_FOUND',
    })
    expect((await run(DONE, { input: { id, done: true } }, bob)).data?.setPetTaskDone).toEqual({
      __typename: 'NotFoundError',
      code: 'TASK_NOT_FOUND',
    })
    expect((await run(DELETE, { input: { id } }, bob)).data?.deletePetTask).toEqual({
      __typename: 'NotFoundError',
      code: 'TASK_NOT_FOUND',
    })
    expect((await run(ADD, { input: { petId, title: '' } })).data?.addPetTask.issues).toEqual([
      { path: ['title'], code: 'REQUIRED' },
    ])
    expect((await run(ADD, { input: { petId, title: 'x' } }, bob)).data?.addPetTask).toEqual({
      __typename: 'NotFoundError',
      code: 'PET_NOT_FOUND',
    })
    expect((await run(DELETE, { input: { id } })).data?.deletePetTask.__typename).toBe(
      'MutationDeletePetTaskSuccess',
    )
    expect((await run(LIST, { id: petId, includeDone: true })).data?.pet.tasks).toEqual([])
  })
})
