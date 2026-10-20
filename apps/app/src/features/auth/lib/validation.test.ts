import { signInSchema, signUpSchema, toFieldErrors } from './validation'

describe('signUpSchema', () => {
  const valid = {
    name: 'Tnk',
    username: 'tnk_01',
    email: 'tnk@example.com',
    password: 'correct-horse',
  }

  it('accepts a valid sign-up and lowercases the username', () => {
    expect(signUpSchema.parse({ ...valid, username: 'Tnk_01' }).username).toBe('tnk_01')
  })

  it.each([
    ['username', 'ab', 'auth.validation.usernameFormat'],
    ['username', 'has space', 'auth.validation.usernameFormat'],
    ['email', 'nope', 'auth.validation.email'],
    ['password', 'short', 'auth.validation.passwordLength'],
    ['name', '', 'auth.validation.required'],
  ])('rejects invalid %s %j with %s', (field, value, key) => {
    const result = signUpSchema.safeParse({ ...valid, [field]: value })
    expect(result.success).toBe(false)
    expect(toFieldErrors(result.error)).toEqual({ [field]: key })
  })
})

describe('signInSchema', () => {
  it('requires identifier and password', () => {
    const result = signInSchema.safeParse({ identifier: '', password: '' })
    expect(toFieldErrors(result.error)).toEqual({
      identifier: 'auth.validation.required',
      password: 'auth.validation.required',
    })
  })
})

describe('toFieldErrors', () => {
  it('returns an empty object when there is no error', () => {
    expect(toFieldErrors(undefined)).toEqual({})
  })
})
