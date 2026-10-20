import type { ApolloClient } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import type { i18n as I18n } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import {
  initialWindowMetrics,
  type Metrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context'

export type AppProvidersProps = {
  i18n: I18n
  client: ApolloClient
  children: ReactNode
  /** Defaults to the real window; tests pass fixed metrics. */
  safeAreaMetrics?: Metrics | null
}

/** Every provider the app needs. Tests use the same tree with mocked dependencies. */
export const AppProviders = ({
  i18n,
  client,
  children,
  safeAreaMetrics = initialWindowMetrics,
}: AppProvidersProps) => (
  <SafeAreaProvider initialMetrics={safeAreaMetrics}>
    <I18nextProvider i18n={i18n}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </I18nextProvider>
  </SafeAreaProvider>
)
