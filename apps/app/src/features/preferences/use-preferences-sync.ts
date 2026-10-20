import type { i18n as I18n } from 'i18next'
import { useEffect } from 'react'
import { Uniwind } from 'uniwind'
import type { Language, ThemePreference } from '@/graphql/generated/graphql'

type Preferences = { locale: Language; theme: ThemePreference }

/** Applies the viewer's saved language + theme whenever they change (incl. after a mutation). */
export const usePreferencesSync = (i18n: I18n, preferences: Preferences | null | undefined) => {
  const locale = preferences?.locale
  const theme = preferences?.theme

  useEffect(() => {
    if (locale) i18n.changeLanguage(locale.toLowerCase())
  }, [i18n, locale])

  useEffect(() => {
    if (theme) Uniwind.setTheme(theme.toLowerCase() as Lowercase<ThemePreference>)
  }, [theme])
}
