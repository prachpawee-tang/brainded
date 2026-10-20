import { describe, expect, it } from 'vitest'
import { createPet, createPetsHarness } from '../../../test/pets-harness'

const LOG = `mutation ($input: LogPetWeightInput!) {
  logPetWeight(input: $input) {
    __typename
    ... on MutationLogPetWeightSuccess {
      data { latestWeight { weightGrams measuredOn note } previousWeight { weightGrams } }
    }
    ... on ValidationError { issues { path code } }
    ... on Error { code }
  }
}`

describe('logPetWeight', () => {
  it('records weights and exposes latest + previous by date', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    await run(LOG, { input: { petId, weightKg: 4.1, measuredOn: '2026-01-01' } })
    await run(LOG, { input: { petId, weightKg: 4.35, measuredOn: '2026-03-01', note: 'หลังอาบน้ำ' } })
    const res = await run(LOG, { input: { petId, weightKg: 4.2, measuredOn: '2026-02-01' } })
    expect(res.data?.logPetWeight).toEqual({
      __typename: 'MutationLogPetWeightSuccess',
      data: {
        latestWeight: { weightGrams: 4350, measuredOn: '2026-03-01', note: 'หลังอาบน้ำ' },
        previousWeight: { weightGrams: 4200 },
      },
    })
  })

  it('rejects out-of-range weights', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    const res = await run(LOG, { input: { petId, weightKg: 0, measuredOn: '2026-01-01' } })
    expect(res.data?.logPetWeight).toEqual({
      __typename: 'ValidationError',
      code: 'VALIDATION_FAILED',
      issues: [{ path: ['weightKg'], code: 'TOO_SMALL' }],
    })
  })

  it("can't log for another user's pet", async () => {
    const { run, bob } = await createPetsHarness()
    const petId = await createPet(run)
    const res = await run(LOG, { input: { petId, weightKg: 4, measuredOn: '2026-01-01' } }, bob)
    expect(res.data?.logPetWeight).toEqual({ __typename: 'NotFoundError', code: 'PET_NOT_FOUND' })
  })
})
