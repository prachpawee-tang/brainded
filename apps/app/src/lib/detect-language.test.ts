import { getLocales } from 'expo-localization'
import { detectLanguage } from './detect-language'

jest.mock('expo-localization', () => ({ getLocales: jest.fn() }))
const mockGetLocales = getLocales as jest.Mock

describe('detectLanguage', () => {
  it('uses the device language when supported', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'en' }])
    expect(detectLanguage()).toBe('en')
  })

  it('falls back to Thai for unsupported languages', () => {
    mockGetLocales.mockReturnValue([{ languageCode: 'fr' }])
    expect(detectLanguage()).toBe('th')
  })

  it('falls back to Thai when the device reports no locale', () => {
    mockGetLocales.mockReturnValue([])
    expect(detectLanguage()).toBe('th')
  })
})
