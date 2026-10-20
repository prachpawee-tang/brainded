import { createTestDb } from '@brain/db/testing'
import { beforeAll, describe, expect, it } from 'vitest'
import { createApp } from './app'

const APP_ORIGIN = 'http://localhost:8081'

type GraphQLResponse = { data?: Record<string, unknown>; errors?: { message: string }[] }

describe('api app', () => {
  let app: ReturnType<typeof createApp>

  const gql = async (query: string): Promise<GraphQLResponse> => {
    const res = await app.request('/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    return res.json() as Promise<GraphQLResponse>
  }

  beforeAll(async () => {
    app = createApp({ db: await createTestDb(), isProduction: true, allowedOrigins: [APP_ORIGIN] })
  })

  it('GET /healthz responds ok', async () => {
    const res = await app.request('/healthz')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('answers the health query over GraphQL', async () => {
    const body = await gql('{ health { status time } }')
    expect(body.errors).toBeUndefined()
    expect(body.data?.health).toMatchObject({ status: 'OK' })
  })

  it('reports the database as reachable', async () => {
    const body = await gql('{ health { database } }')
    expect(body.data?.health).toEqual({ database: true })
  })

  it('disables introspection in production', async () => {
    const body = await gql('{ __schema { types { name } } }')
    expect(body.errors?.[0]?.message).toMatch(/introspection/i)
  })

  it('allows introspection and GraphiQL outside production', async () => {
    const devApp = createApp({ db: await createTestDb(), isProduction: false, allowedOrigins: [] })
    const res = await devApp.request('/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ __schema { queryType { name } } }' }),
    })
    expect(await res.json()).toEqual({ data: { __schema: { queryType: { name: 'Query' } } } })
    const page = await devApp.request('/graphql', { headers: { accept: 'text/html' } })
    expect(await page.text()).toContain('GraphiQL')
  })
  const preflight = (origin: string) =>
    app.request('/graphql', {
      method: 'OPTIONS',
      headers: { origin, 'access-control-request-method': 'POST' },
    })

  it('allows CORS with credentials from the app origin', async () => {
    const res = await preflight(APP_ORIGIN)
    expect(res.headers.get('access-control-allow-origin')).toBe(APP_ORIGIN)
    expect(res.headers.get('access-control-allow-credentials')).toBe('true')
  })

  it('does not allow CORS from unknown origins', async () => {
    const res = await preflight('https://evil.example')
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })
})
