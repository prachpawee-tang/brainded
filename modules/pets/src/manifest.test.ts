import { describe, expect, it } from 'vitest'
import { petsModule } from './manifest'

describe('petsModule', () => {
  it('uses the pets id, route and namespace', () => {
    expect(petsModule).toMatchObject({ id: 'pets', route: '/pets', namespace: 'pets' })
  })
})
