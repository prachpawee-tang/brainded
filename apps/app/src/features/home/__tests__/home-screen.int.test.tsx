import { render, screen } from '@testing-library/react-native'
import { createTestProviders } from '@/test/create-test-providers'
import { ApiHealthQuery } from '../graphql/health'
import { HomeScreen } from '../screens/home-screen'

const healthOk = {
  request: { query: ApiHealthQuery },
  result: { data: { health: { __typename: 'Health' as const, status: 'OK' as const } } },
}

const healthDown = {
  request: { query: ApiHealthQuery },
  error: new Error('Network request failed'),
}

describe('HomeScreen', () => {
  it('greets the user in their language', async () => {
    const wrapper = await createTestProviders({ lng: 'th', mocks: [healthOk] })
    await render(<HomeScreen />, { wrapper })
    expect(screen.getByRole('header', { name: 'สวัสดี 👋' })).toBeOnTheScreen()
  })

  it('shows that the API is online when the health check succeeds', async () => {
    const wrapper = await createTestProviders({ lng: 'en', mocks: [healthOk] })
    await render(<HomeScreen />, { wrapper })
    expect(await screen.findByText('Connected')).toBeOnTheScreen()
  })

  it('shows offline when the API cannot be reached', async () => {
    const wrapper = await createTestProviders({ lng: 'en', mocks: [healthDown] })
    await render(<HomeScreen />, { wrapper })
    expect(await screen.findByText('Offline')).toBeOnTheScreen()
  })

  it('shows a checking state while the health query is in flight', async () => {
    const wrapper = await createTestProviders({ lng: 'en', mocks: [healthOk] })
    await render(<HomeScreen />, { wrapper })
    expect(screen.getByText('Checking…')).toBeOnTheScreen()
  })
})
