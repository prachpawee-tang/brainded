import { createTestDb } from '@brain/db/testing'
import { beforeAll, describe, expect, it } from 'vitest'
import { createApp } from './app'

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
    app = createApp({ db: await createTestDb(), isProduction: true })
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
    const devApp = createApp({ db: await createTestDb(), isProduction: false })
    const res = await devApp.request('/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ __schema { queryType { name } } }' }),
    })
    expect(await res.json()).toEqual({ data: { __schema: { queryType: { name: 'Query' } } } })
    const page = await devApp.request('/graphql', { headers: { accept: 'text/html' } })
    expect(await page.text()).toContain('GraphiQL')
  })
})
