import i18next, { type i18n as I18n } from 'i18next'
import type { LocaleTree } from './key-parity'
import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  type Language,
  SUPPORTED_LANGUAGES,
} from './languages'
import en from './locales/en.json' with { type: 'json' }
import th from './locales/th.json' with { type: 'json' }

/** Translations for one namespace, one tree per language. Modules export this shape. */
export type NamespaceResources = Record<Language, LocaleTree>

export type CreateI18nOptions = {
  lng?: Language
  namespaces?: Record<string, NamespaceResources>
  plugins?: Parameters<I18n['use']>[0][]
}

export const COMMON_NAMESPACE = 'common'

export const createI18n = async ({
  lng = DEFAULT_LANGUAGE,
  namespaces = {},
  plugins = [],
}: CreateI18nOptions = {}): Promise<I18n> => {
  const all: Record<string, NamespaceResources> = { [COMMON_NAMESPACE]: { en, th }, ...namespaces }
  const resources = Object.fromEntries(
    SUPPORTED_LANGUAGES.map((language) => [
      language,
      Object.fromEntries(Object.entries(all).map(([ns, tree]) => [ns, tree[language]])),
    ]),
  )

  const instance = i18next.createInstance()
  for (const plugin of plugins) instance.use(plugin)
  await instance.init({
    lng,
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: Object.keys(all),
    defaultNS: COMMON_NAMESPACE,
    resources,
    interpolation: { escapeValue: false },
    returnNull: false,
  })
  return instance
}
