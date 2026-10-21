import { render, screen, userEvent, waitFor } from '@testing-library/react-native'
import {
  SetModuleEnabledMutation,
  UpdatePreferencesMutation,
} from '@/features/viewer/graphql/viewer'
import { authClient } from '@/lib/auth-client'
import { createTestProviders } from '@/test/create-test-providers'
import type { AuthClientMock } from '@/test/mock-auth-client'
import { viewerMock } from '@/test/viewer-fixture'
import { SettingsScreen } from '../screens/settings-screen'

jest.mock('@/lib/auth-client', () =>
  jest.requireActual('@/test/mock-auth-client').createAuthClientMock(),
)
jest.mock('expo-router', () => ({ router: { canGoBack: () => true, back: jest.fn() } }))
jest.mock('expo-linking', () => ({
  createURL: (path: string) => `brain://${path.replace(/^\//, '')}`,
}))

const auth = authClient as unknown as AuthClientMock

const CREDENTIAL = { id: 'acc-1', providerId: 'credential', accountId: 'u1' }
const GOOGLE = { id: 'acc-2', providerId: 'google', accountId: 'g-123' }

const updatePreferencesMock = (input: Record<string, string>, data: Record<string, string>) => {
  const result = jest.fn(() => ({
    data: {
      updatePreferences: {
        __typename: 'MutationUpdatePreferencesSuccess',
        data: { __typename: 'Viewer', id: 'u1', locale: 'EN', theme: 'SYSTEM', ...data },
      },
    },
  }))
  return {
    mock: { request: { query: UpdatePreferencesMutation, variables: { input } }, result },
    result,
  }
}

const setup = async (mocks: unknown[] = []) => {
  const user = userEvent.setup()
  await render(<SettingsScreen />, {
    wrapper: await createTestProviders({ lng: 'en', mocks: [viewerMock(), ...(mocks as never[])] }),
  })
  await screen.findByText('tnk@example.com')
  return user
}

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    auth.listAccounts.mockResolvedValue({ data: [CREDENTIAL], error: null })
    auth.unlinkAccount.mockResolvedValue({ data: {}, error: null })
  })

  it('saves the chosen language', async () => {
    const { mock, result } = updatePreferencesMock({ locale: 'TH' }, { locale: 'TH' })
    const user = await setup([mock])
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked()
    await user.press(screen.getByRole('radio', { name: 'ไทย' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('saves the chosen theme', async () => {
    const { mock, result } = updatePreferencesMock({ theme: 'DARK' }, { theme: 'DARK' })
    const user = await setup([mock])
    await user.press(screen.getByRole('radio', { name: 'Dark' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('turns a module off', async () => {
    const result = jest.fn(() => ({
      data: {
        setModuleEnabled: {
          __typename: 'MutationSetModuleEnabledSuccess',
          data: { __typename: 'UserModule', moduleId: 'pets', enabled: false },
        },
      },
    }))
    const user = await setup([
      {
        request: {
          query: SetModuleEnabledMutation,
          variables: { input: { moduleId: 'pets', enabled: false } },
        },
        result,
      },
    ])
    await user.press(screen.getByRole('switch', { name: 'Pets' }))
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Pets' })).not.toBeChecked())
    expect(result).toHaveBeenCalled()
  })

  it('offers to connect Google when only a password is linked', async () => {
    const user = await setup()
    expect(await screen.findByText('Username & password')).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Connect Google' }))
    expect(auth.linkSocial).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: 'brain://settings',
    })
  })

  it('unlinks a provider when more than one is linked', async () => {
    auth.listAccounts.mockResolvedValue({ data: [CREDENTIAL, GOOGLE], error: null })
    const user = await setup()
    expect(await screen.findByText('Google')).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: 'Connect Google' })).not.toBeOnTheScreen()
    const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
    await user.press(removeButtons[1] as never)
    expect(auth.unlinkAccount).toHaveBeenCalledWith({ accountId: 'acc-2' })
    expect(auth.listAccounts).toHaveBeenCalledTimes(2)
  })

  it('shows why an unlink failed', async () => {
    auth.listAccounts.mockResolvedValue({ data: [CREDENTIAL, GOOGLE], error: null })
    auth.unlinkAccount.mockResolvedValue({
      data: null,
      error: { code: 'FAILED_TO_UNLINK_LAST_ACCOUNT' },
    })
    const user = await setup()
    await user.press((await screen.findAllByRole('button', { name: 'Remove' }))[0] as never)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "You can't remove your only sign-in method",
    )
  })

  it('signs out', async () => {
    const user = await setup()
    await user.press(screen.getByRole('button', { name: 'Sign out' }))
    expect(auth.signOut).toHaveBeenCalled()
  })
})
