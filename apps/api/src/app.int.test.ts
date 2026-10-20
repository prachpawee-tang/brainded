import { describe, expect, it } from 'vitest'
import { createTestApp, TEST_APP_ORIGIN } from './test/create-test-app'

describe('api app', () => {
  it('GET /healthz responds ok', async () => {
    const { app } = await createTestApp()
    const res = await app.request('/healthz')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('answers the health query and reaches the database', async () => {
    const { gql } = await createTestApp()
    const body = await gql('{ health { status database time } }')
    expect(body.errors).toBeUndefined()
    expect(body.data?.health).toMatchObject({ status: 'OK', database: true })
  })

  it('disables introspection in production', async () => {
    const { gql } = await createTestApp()
    const body = await gql('{ __schema { types { name } } }')
    expect(body.errors?.[0]?.message).toMatch(/introspection/i)
  })

  it('allows introspection and GraphiQL outside production', async () => {
    const { app, gql } = await createTestApp({ isProduction: false })
    expect((await gql('{ __schema { queryType { name } } }')).data).toEqual({
      __schema: { queryType: { name: 'Query' } },
    })
    const page = await app.request('/graphql', { headers: { accept: 'text/html' } })
    expect(await page.text()).toContain('GraphiQL')
  })

  const preflight = async (path: string, origin: string) => {
    const { app } = await createTestApp()
    return app.request(path, {
      method: 'OPTIONS',
      headers: { origin, 'access-control-request-method': 'POST' },
    })
  }

  it.each(['/graphql', '/api/auth/sign-in/username'])(
    'allows CORS with credentials from the app origin on %s',
    async (path) => {
      const res = await preflight(path, TEST_APP_ORIGIN)
      expect(res.headers.get('access-control-allow-origin')).toBe(TEST_APP_ORIGIN)
      expect(res.headers.get('access-control-allow-credentials')).toBe('true')
    },
  )

  it('does not allow CORS from unknown origins', async () => {
    const res = await preflight('/graphql', 'https://evil.example')
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('mounts Better Auth under /api/auth', async () => {
    const { app } = await createTestApp()
    const res = await app.request('/api/auth/ok')
    expect(res.status).toBe(200)
  })
})
