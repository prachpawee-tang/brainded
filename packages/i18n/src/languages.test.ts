import { describe, expect, it } from 'vitest'
import { isSupportedLanguage } from './languages'

describe('isSupportedLanguage', () => {
  it.each(['th', 'en'])('accepts %s', (lng) => expect(isSupportedLanguage(lng)).toBe(true))
  it.each(['fr', '', 'TH'])('rejects %s', (lng) => expect(isSupportedLanguage(lng)).toBe(false))
})
