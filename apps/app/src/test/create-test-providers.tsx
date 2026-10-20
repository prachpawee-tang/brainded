import { InMemoryCache } from '@apollo/client'
import { MockedProvider, type MockedProviderProps } from '@apollo/client/testing/react'
import type { Language } from '@brain/i18n'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { initI18n } from '@/lib/i18n'

export const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

type Options = { lng?: Language; mocks?: MockedProviderProps['mocks'] }

/** Wrapper for RNTL `render(…, { wrapper })`: real i18n + mocked GraphQL. */
export const createTestProviders = async ({ lng = 'en', mocks = [] }: Options = {}) => {
  const i18n = await initI18n(lng)
  return ({ children }: { children: ReactNode }) => (
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <I18nextProvider i18n={i18n}>
        <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
          {children}
        </MockedProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  )
}
