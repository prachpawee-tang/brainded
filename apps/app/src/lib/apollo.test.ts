import { ApolloClient, gql } from '@apollo/client'
import { Platform } from 'react-native'
import { createApolloClient } from './apollo'

const QUERY = gql`{ viewer { id } }`

const fetchSpy = () => {
  const spy = jest.fn(
    async () =>
      new Response(JSON.stringify({ data: { viewer: null } }), {
        headers: { 'content-type': 'application/json' },
      }),
  )
  global.fetch = spy as unknown as typeof fetch
  return spy
}

const lastRequest = (spy: jest.Mock) => spy.mock.calls.at(-1) as [string, RequestInit]

describe('createApolloClient', () => {
  const originalOS = Platform.OS
  afterEach(() => {
    Platform.OS = originalOS
  })

  it('creates a client', () => {
    expect(createApolloClient()).toBeInstanceOf(ApolloClient)
  })

  it('attaches the stored session cookie on native', async () => {
    Platform.OS = 'ios'
    const spy = fetchSpy()
    await createApolloClient({ uri: 'http://api/graphql', getCookie: () => 'session=abc' }).query({
      query: QUERY,
    })
    const [, init] = lastRequest(spy)
    expect((init.headers as Record<string, string>).cookie).toBe('session=abc')
    expect(init.credentials).toBe('omit')
  })

  it('relies on browser cookies on web', async () => {
    Platform.OS = 'web'
    const spy = fetchSpy()
    await createApolloClient({ uri: 'http://api/graphql', getCookie: () => 'session=abc' }).query({
      query: QUERY,
    })
    const [, init] = lastRequest(spy)
    expect((init.headers as Record<string, string>).cookie).toBeUndefined()
    expect(init.credentials).toBe('include')
  })
})
