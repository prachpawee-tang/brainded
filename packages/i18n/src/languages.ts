export const SUPPORTED_LANGUAGES = ['th', 'en'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'th'
export const FALLBACK_LANGUAGE: Language = 'en'

export const isSupportedLanguage = (value: string): value is Language =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
