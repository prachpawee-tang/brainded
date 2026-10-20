import { describe, expect, it } from 'vitest'
import { createPet, createPetsHarness } from '../../../test/pets-harness'

const LOG = `mutation ($input: LogPetWeightInput!) { logPetWeight(input: $input) { __typename } }`
const WEIGHTS = `query ($id: ID!, $since: LocalDate) { pet(id: $id) { weights(since: $since) { weightGrams measuredOn } } }`

describe('Pet.weights', () => {
  it('returns weights oldest first, optionally since a date', async () => {
    const { run } = await createPetsHarness()
    const petId = await createPet(run)
    for (const [kg, on] of [
      [4.3, '2026-03-01'],
      [4.1, '2026-01-01'],
      [4.2, '2026-02-01'],
    ] as const) {
      await run(LOG, { input: { petId, weightKg: kg, measuredOn: on } })
    }
    const all = await run(WEIGHTS, { id: petId })
    expect(all.data?.pet.weights.map((w: { measuredOn: string }) => w.measuredOn)).toEqual([
      '2026-01-01',
      '2026-02-01',
      '2026-03-01',
    ])
    const recent = await run(WEIGHTS, { id: petId, since: '2026-02-01' })
    expect(recent.data?.pet.weights).toEqual([
      { weightGrams: 4200, measuredOn: '2026-02-01' },
      { weightGrams: 4300, measuredOn: '2026-03-01' },
    ])
  })
})
