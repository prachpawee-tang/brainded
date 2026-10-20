import { describe, expect, it } from 'vitest'
import { defineModule, findModule } from './module-manifest'

const pets = defineModule({ id: 'pets', icon: '🐾', route: '/pets', namespace: 'pets' })

describe('defineModule', () => {
  it('returns the manifest unchanged', () => {
    expect(pets).toEqual({ id: 'pets', icon: '🐾', route: '/pets', namespace: 'pets' })
  })

  it.each(['Pets', 'pet_care', '', '1pets'])('rejects invalid id %j', (id) => {
    expect(() => defineModule({ id, icon: '🐾', route: '/x', namespace: 'x' })).toThrow(
      `Invalid module id: ${id}`,
    )
  })

  it('rejects routes that do not start with /', () => {
    expect(() =>
      defineModule({ id: 'pets', icon: '🐾', route: 'pets', namespace: 'pets' }),
    ).toThrow('Module route must start with "/": pets')
  })
})

describe('findModule', () => {
  it('finds a module by id or returns undefined', () => {
    expect(findModule([pets], 'pets')).toBe(pets)
    expect(findModule([pets], 'finance')).toBeUndefined()
  })
})
