/** jest.mock factory for '@/lib/auth-client'. Every method resolves `{ data, error: null }` by default. */
export const createAuthClientMock = () => ({
  authClient: {
    signIn: { username: jest.fn(), email: jest.fn(), social: jest.fn() },
    signUp: { email: jest.fn() },
    signOut: jest.fn(),
    listAccounts: jest.fn(),
    linkSocial: jest.fn(),
    unlinkAccount: jest.fn(),
    useSession: jest.fn(),
    getCookie: jest.fn(),
  },
})

export type AuthClientMock = ReturnType<typeof createAuthClientMock>['authClient']
