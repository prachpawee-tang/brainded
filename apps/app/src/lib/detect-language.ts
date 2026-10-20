import { DEFAULT_LANGUAGE, isSupportedLanguage, type Language } from '@brain/i18n'
import { getLocales } from 'expo-localization'

/** Device language if we support it, otherwise the app default (Thai). */
export const detectLanguage = (): Language => {
  const code = getLocales()[0]?.languageCode ?? ''
  return isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE
}
