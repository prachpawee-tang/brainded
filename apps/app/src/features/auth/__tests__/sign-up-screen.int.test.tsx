import { render, screen, userEvent } from '@testing-library/react-native'
import { router } from 'expo-router'
import { authClient } from '@/lib/auth-client'
import { createTestProviders } from '@/test/create-test-providers'
import type { AuthClientMock } from '@/test/mock-auth-client'
import { SignUpScreen } from '../screens/sign-up-screen'

jest.mock('@/lib/auth-client', () =>
  jest.requireActual('@/test/mock-auth-client').createAuthClientMock(),
)
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}))

const auth = authClient as unknown as AuthClientMock

const setup = async () => {
  const user = userEvent.setup()
  await render(<SignUpScreen />, { wrapper: await createTestProviders({ lng: 'en' }) })
  return user
}

const fillValid = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Display name'), 'Tnk')
  await user.type(screen.getByLabelText('Username'), 'Tnk')
  await user.type(screen.getByLabelText('Email'), 'tnk@example.com')
  await user.type(screen.getByLabelText('Password'), 'correct-horse')
}

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    auth.signUp.email.mockResolvedValue({ data: {}, error: null })
  })

  it('creates the account with a normalized username', async () => {
    const user = await setup()
    await fillValid(user)
    await user.press(screen.getByRole('button', { name: 'Create account' }))
    expect(auth.signUp.email).toHaveBeenCalledWith({
      name: 'Tnk',
      username: 'tnk',
      email: 'tnk@example.com',
      password: 'correct-horse',
    })
  })

  it('shows field errors and does not submit invalid input', async () => {
    const user = await setup()
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.press(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByText('At least 10 characters')).toBeOnTheScreen()
    expect(auth.signUp.email).not.toHaveBeenCalled()
  })

  it('shows a translated server error', async () => {
    auth.signUp.email.mockResolvedValue({
      data: null,
      error: { code: 'USERNAME_IS_ALREADY_TAKEN' },
    })
    const user = await setup()
    await fillValid(user)
    await user.press(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('That username is taken')).toBeOnTheScreen()
  })

  it('goes back to sign-in', async () => {
    const user = await setup()
    await user.press(screen.getByRole('button', { name: 'Already have an account? Sign in' }))
    expect(router.replace).toHaveBeenCalledWith('/sign-in')
  })
})
