import { describe, expect, it } from 'vitest'
import type { NamespaceResources } from './create-i18n'
import { findMissingKeys } from './key-parity'

/** Call from a module's test file to assert en/th key parity for its namespace. */
export const describeLocaleParity = (namespace: string, resources: NamespaceResources) =>
  describe(`${namespace} locales`, () => {
    it('th has every key that en has', () => {
      expect(findMissingKeys(resources.en, resources.th)).toEqual([])
    })
    it('en has every key that th has', () => {
      expect(findMissingKeys(resources.th, resources.en)).toEqual([])
    })
  })
