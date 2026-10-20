import { createTestDb } from '@brain/db/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { type Auth, createAuth } from './create-auth'

const BASE_URL = 'http://localhost:4000'
const APP_ORIGIN = 'http://localhost:8081'
const PASSWORD = 'correct-horse-battery'

const json = (body: unknown) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: APP_ORIGIN },
  body: JSON.stringify(body),
})

describe('createAuth', () => {
  let auth: Auth

  const call = (path: string, init?: RequestInit) =>
    auth.handler(new Request(`${BASE_URL}/api/auth${path}`, init))

  const signUp = () =>
    call(
      '/sign-up/email',
      json({ name: 'Tnk', email: 'tnk@example.com', username: 'tnk', password: PASSWORD }),
    )

  const cookieFrom = (res: Response) =>
    res.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ')

  beforeEach(async () => {
    auth = createAuth({
      db: await createTestDb(),
      secret: 'test-secret-at-least-32-characters-long!!',
      baseURL: BASE_URL,
      trustedOrigins: [APP_ORIGIN],
    })
  })

  it('signs up with email + username and defaults preferences', async () => {
    const res = await signUp()
    expect(res.status).toBe(200)
    const body = (await res.json()) as { user: Record<string, unknown> }
    expect(body.user).toMatchObject({
      email: 'tnk@example.com',
      username: 'tnk',
      locale: 'th',
      theme: 'system',
    })
  })

  it('signs in with username and returns a session cookie', async () => {
    await signUp()
    const res = await call('/sign-in/username', json({ username: 'tnk', password: PASSWORD }))
    expect(res.status).toBe(200)
    const session = await auth.api.getSession({ headers: new Headers({ cookie: cookieFrom(res) }) })
    expect(session?.user.username).toBe('tnk')
  })

  it('rejects a wrong password', async () => {
    await signUp()
    const res = await call(
      '/sign-in/username',
      json({ username: 'tnk', password: 'nope-nope-nope' }),
    )
    expect(res.status).toBe(401)
  })

  it('refuses to unlink the only sign-in method', async () => {
    const cookie = cookieFrom(await signUp())
    const accounts = (await (await call('/list-accounts', { headers: { cookie } })).json()) as {
      id: string
    }[]
    expect(accounts).toHaveLength(1)
    const res = await call('/unlink-account', {
      ...json({ providerId: 'credential', accountId: accounts[0]?.id }),
      headers: { 'content-type': 'application/json', origin: APP_ORIGIN, cookie },
    })
    expect(res.status).toBe(400)
  })

  it('rejects requests from untrusted origins', async () => {
    const res = await call('/sign-up/email', {
      ...json({ name: 'X', email: 'x@example.com', password: PASSWORD }),
      headers: {
        'content-type': 'application/json',
        origin: 'https://evil.example',
        cookie: 'a=b',
      },
    })
    expect(res.status).toBe(403)
  })

  it('enables Google only when credentials are provided', async () => {
    const withGoogle = createAuth({
      db: await createTestDb(),
      secret: 'test-secret-at-least-32-characters-long!!',
      baseURL: BASE_URL,
      trustedOrigins: [APP_ORIGIN],
      google: { clientId: 'id', clientSecret: 'secret' },
    })
    const signInGoogle = (a: Auth) =>
      a.handler(
        new Request(
          `${BASE_URL}/api/auth/sign-in/social`,
          json({ provider: 'google', callbackURL: APP_ORIGIN }),
        ),
      )
    expect((await signInGoogle(withGoogle)).status).toBe(200)
    expect((await signInGoogle(auth)).status).not.toBe(200)
  })
})
