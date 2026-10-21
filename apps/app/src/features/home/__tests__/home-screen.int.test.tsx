import { render, screen, userEvent } from '@testing-library/react-native'
import { router } from 'expo-router'
import { createTestProviders } from '@/test/create-test-providers'
import { buildViewer, viewerMock } from '@/test/viewer-fixture'
import { HomeScreen } from '../screens/home-screen'

jest.mock('expo-router', () => ({ router: { canGoBack: () => true, push: jest.fn() } }))
jest.mock('uniwind', () => ({ useUniwind: () => ({ theme: 'light' }) }))

const setup = async (mocks = [viewerMock()]) => {
  const user = userEvent.setup()
  await render(<HomeScreen />, { wrapper: await createTestProviders({ lng: 'en', mocks }) })
  return user
}

describe('HomeScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('greets the viewer by name', async () => {
    await setup()
    expect(await screen.findByRole('header', { name: 'Hi Tnk 👋' })).toBeOnTheScreen()
  })

  it('opens an enabled module from its tile', async () => {
    const user = await setup()
    await user.press(await screen.findByRole('button', { name: 'Pets' }))
    expect(router.push).toHaveBeenCalledWith('/pets')
  })

  it('shows an empty state when every module is off', async () => {
    const viewer = buildViewer({
      modules: [{ __typename: 'UserModule', moduleId: 'pets', enabled: false }],
    })
    const user = await setup([viewerMock(viewer)])
    expect(await screen.findByText('No modules turned on yet')).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: 'Pets' })).not.toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Choose modules' }))
    expect(router.push).toHaveBeenCalledWith('/settings')
  })

  it('opens settings', async () => {
    const user = await setup()
    await user.press(await screen.findByRole('button', { name: 'Settings' }))
    expect(router.push).toHaveBeenCalledWith('/settings')
  })
})
