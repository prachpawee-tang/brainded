import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { printApiSchema, SCHEMA_PATH } from './schema'

describe('API schema', () => {
  it('matches the committed schema.graphql (run `pnpm codegen`)', () => {
    expect(readFileSync(SCHEMA_PATH, 'utf8')).toBe(printApiSchema())
  })
})
