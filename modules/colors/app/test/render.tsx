import { InMemoryCache } from '@apollo/client'
import { MockedProvider, type MockedProviderProps } from '@apollo/client/testing/react'
import { createI18n, type Language } from '@brain/i18n'
import { render } from '@testing-library/react-native'
import type { ReactElement, ReactNode } from 'react'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { colorsLocales } from '../../src/locales'
import { ColorFavoritesQuery } from '../graphql/favorites'

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

export const favoritesMock = (
  favorites: { kind: 'COLOR' | 'COMBINATION'; ref: string }[] = [],
) => ({
  request: { query: ColorFavoritesQuery },
  result: {
    data: {
      colorFavorites: favorites.map((f, i) => ({
        __typename: 'ColorFavorite' as const,
        id: `f${i}`,
        ...f,
      })),
    },
  },
})

/** Renders a colors screen with real i18n (colors namespace) and mocked GraphQL. */
export const renderColors = async (
  ui: ReactElement,
  {
    lng = 'en',
    mocks = [favoritesMock()],
  }: { lng?: Language; mocks?: MockedProviderProps['mocks'] } = {},
) => {
  const i18n = await createI18n({
    lng,
    namespaces: { colors: colorsLocales },
    plugins: [initReactI18next],
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SafeAreaProvider initialMetrics={METRICS}>
      <I18nextProvider i18n={i18n}>
        <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
          {children}
        </MockedProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  )
  return render(ui, { wrapper })
}
