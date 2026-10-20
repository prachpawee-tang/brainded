import { render, screen, userEvent } from '@testing-library/react-native'
import { router } from 'expo-router'
import { authClient } from '@/lib/auth-client'
import { createTestProviders } from '@/test/create-test-providers'
import type { AuthClientMock } from '@/test/mock-auth-client'
import { SignInScreen } from '../screens/sign-in-screen'

jest.mock('@/lib/auth-client', () =>
  jest.requireActual('@/test/mock-auth-client').createAuthClientMock(),
)
jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }))
jest.mock('expo-linking', () => ({
  createURL: (path: string) => `brain://${path.replace(/^\//, '')}`,
}))

const auth = authClient as unknown as AuthClientMock

const setup = async () => {
  const user = userEvent.setup()
  await render(<SignInScreen />, { wrapper: await createTestProviders({ lng: 'en' }) })
  return user
}

const fill = async (
  user: ReturnType<typeof userEvent.setup>,
  identifier: string,
  password: string,
) => {
  await user.type(screen.getByLabelText('Username or email'), identifier)
  await user.type(screen.getByLabelText('Password'), password)
  await user.press(screen.getByRole('button', { name: 'Sign in' }))
}

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    auth.signIn.username.mockResolvedValue({ data: {}, error: null })
    auth.signIn.email.mockResolvedValue({ data: {}, error: null })
  })

  it('signs in with a username', async () => {
    const user = await setup()
    await fill(user, 'tnk', 'correct-horse')
    expect(auth.signIn.username).toHaveBeenCalledWith({
      username: 'tnk',
      password: 'correct-horse',
    })
    expect(auth.signIn.email).not.toHaveBeenCalled()
  })

  it('signs in with an email when the identifier contains @', async () => {
    const user = await setup()
    await fill(user, 'tnk@example.com', 'correct-horse')
    expect(auth.signIn.email).toHaveBeenCalledWith({
      email: 'tnk@example.com',
      password: 'correct-horse',
    })
  })

  it('validates before calling the server', async () => {
    const user = await setup()
    await user.press(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getAllByText('This field is required')).toHaveLength(2)
    expect(auth.signIn.username).not.toHaveBeenCalled()
  })

  it('shows a translated error for wrong credentials', async () => {
    auth.signIn.username.mockResolvedValue({
      data: null,
      error: { code: 'INVALID_USERNAME_OR_PASSWORD' },
    })
    const user = await setup()
    await fill(user, 'tnk', 'wrong-password')
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong username/email or password')
  })

  it('starts Google sign-in returning to the app', async () => {
    const user = await setup()
    await user.press(screen.getByRole('button', { name: 'Continue with Google' }))
    expect(auth.signIn.social).toHaveBeenCalledWith({ provider: 'google', callbackURL: 'brain://' })
  })

  it('links to sign-up', async () => {
    const user = await setup()
    await user.press(screen.getByRole('button', { name: 'New here? Create an account' }))
    expect(router.push).toHaveBeenCalledWith('/sign-up')
  })
})
