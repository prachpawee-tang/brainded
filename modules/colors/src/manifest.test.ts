import { describe, expect, it } from 'vitest'
import { colorsModule } from './manifest'

describe('colorsModule', () => {
  it('uses the colors id, route and namespace', () => {
    expect(colorsModule).toMatchObject({ id: 'colors', route: '/colors', namespace: 'colors' })
  })
})
