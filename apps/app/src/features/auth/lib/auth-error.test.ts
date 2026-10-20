import { authErrorKey } from './auth-error'

describe('authErrorKey', () => {
  it.each([
    ['INVALID_USERNAME_OR_PASSWORD', 'auth.errors.invalidCredentials'],
    ['INVALID_EMAIL_OR_PASSWORD', 'auth.errors.invalidCredentials'],
    ['USER_ALREADY_EXISTS', 'auth.errors.emailTaken'],
    ['USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL', 'auth.errors.emailTaken'],
    ['USERNAME_IS_ALREADY_TAKEN', 'auth.errors.usernameTaken'],
    ['FAILED_TO_UNLINK_LAST_ACCOUNT', 'auth.errors.lastAccount'],
  ])('maps %s to %s', (code, key) => {
    expect(authErrorKey({ code })).toBe(key)
  })

  it('falls back to a generic message for unknown or missing codes', () => {
    expect(authErrorKey({ code: 'SOMETHING_NEW' })).toBe('auth.errors.unknown')
    expect(authErrorKey(null)).toBe('auth.errors.unknown')
  })
})
