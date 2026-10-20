import { createAuth } from '@brain/auth'
import { createTestDb } from '@brain/db/testing'
import { createApp } from '../app'

export const TEST_APP_ORIGIN = 'http://localhost:8081'
const BASE_URL = 'http://localhost:4000'

type GraphQLResponse = {
  data?: Record<string, unknown> | null
  errors?: { message: string }[]
}

/** Real app + real auth + in-memory Postgres. One per test for isolation. */
export const createTestApp = async ({ isProduction = true } = {}) => {
  const db = await createTestDb()
  const auth = createAuth({
    db,
    secret: 'test-secret-at-least-32-characters-long!!',
    baseURL: BASE_URL,
    trustedOrigins: [TEST_APP_ORIGIN],
  })
  const app = createApp({ db, auth, isProduction, allowedOrigins: [TEST_APP_ORIGIN] })

  /** Signs up a user and returns its session cookie. */
  const signUp = async (username = 'tnk'): Promise<string> => {
    const res = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: TEST_APP_ORIGIN },
      body: JSON.stringify({
        name: username,
        email: `${username}@example.com`,
        username,
        password: 'correct-horse-battery',
      }),
    })
    if (res.status !== 200) throw new Error(`sign-up failed: ${res.status} ${await res.text()}`)
    return res.headers
      .getSetCookie()
      .map((cookie) => cookie.split(';')[0])
      .join('; ')
  }

  const gql = async <T = Record<string, unknown>>(
    query: string,
    { variables, cookie }: { variables?: Record<string, unknown>; cookie?: string } = {},
  ) => {
    const res = await app.request('/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: TEST_APP_ORIGIN,
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ query, variables }),
    })
    return (await res.json()) as GraphQLResponse & { data?: T | null }
  }

  return { app, db, signUp, gql }
}
