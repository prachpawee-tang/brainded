import { createI18n, type Language, type NamespaceResources } from '@brain/i18n'
import { petsLocales } from '@brain/module-pets/locales'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import th from '../locales/th.json'

export const APP_NAMESPACE = 'app'

/** App shell namespace + every module namespace (modules are added here as they ship). */
export const APP_NAMESPACES: Record<string, NamespaceResources> = {
  [APP_NAMESPACE]: { en, th },
  pets: petsLocales,
}

export const initI18n = (lng: Language) =>
  createI18n({ lng, namespaces: APP_NAMESPACES, plugins: [initReactI18next] })
