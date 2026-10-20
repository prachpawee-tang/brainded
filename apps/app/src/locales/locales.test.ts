import { findMissingKeys } from '@brain/i18n'
import en from './en.json'
import th from './th.json'

describe('app locales', () => {
  it('th has every key that en has', () => expect(findMissingKeys(en, th)).toEqual([]))
  it('en has every key that th has', () => expect(findMissingKeys(th, en)).toEqual([]))
})
