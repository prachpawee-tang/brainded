import { render, screen } from '@testing-library/react-native'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
import { createApolloClient } from '@/lib/apollo'
import { initI18n } from '@/lib/i18n'
import { TEST_SAFE_AREA_METRICS } from '@/test/create-test-providers'
import { AppProviders } from './app-providers'

const Probe = () => {
  const { t } = useTranslation('app')
  return <Text>{t('home.greeting', { name: 'Tnk' })}</Text>
}

describe('AppProviders', () => {
  it('provides i18n to its children', async () => {
    const i18n = await initI18n('en')
    await render(
      <AppProviders
        i18n={i18n}
        client={createApolloClient({ uri: 'http://test/graphql' })}
        safeAreaMetrics={TEST_SAFE_AREA_METRICS}
      >
        <Probe />
      </AppProviders>,
    )
    expect(screen.getByText('Hi Tnk 👋')).toBeOnTheScreen()
  })
})
