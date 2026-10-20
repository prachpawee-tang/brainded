import { InMemoryCache } from '@apollo/client'
import { MockedProvider, type MockedProviderProps } from '@apollo/client/testing/react'
import { createI18n, type Language } from '@brain/i18n'
import { render } from '@testing-library/react-native'
import type { ReactElement, ReactNode } from 'react'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { petsLocales } from '../../src/locales'
import { type PetsServices, PetsServicesProvider } from '../lib/pets-services'

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

type Options = {
  lng?: Language
  mocks?: MockedProviderProps['mocks']
  services?: Partial<PetsServices>
}

/** Renders a pets screen with real i18n (pets namespace), mocked GraphQL and stub services. */
export const renderPets = async (
  ui: ReactElement,
  { lng = 'en', mocks = [], services = {} }: Options = {},
) => {
  const i18n = await createI18n({
    lng,
    namespaces: { pets: petsLocales },
    plugins: [initReactI18next],
  })
  const value: PetsServices = {
    uploadPhoto: jest.fn(async () => 'u1/uploads/photo.jpg'),
    ...services,
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SafeAreaProvider initialMetrics={METRICS}>
      <I18nextProvider i18n={i18n}>
        <PetsServicesProvider value={value}>
          <MockedProvider mocks={mocks} cache={new InMemoryCache()}>
            {children}
          </MockedProvider>
        </PetsServicesProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  )
  return render(ui, { wrapper })
}
