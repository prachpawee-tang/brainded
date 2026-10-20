import { ApolloClient } from '@apollo/client'
import { API_URL, createApolloClient } from './apollo'

describe('createApolloClient', () => {
  it('creates a client pointing at the configured API by default', () => {
    expect(API_URL).toMatch(/\/graphql$/)
    expect(createApolloClient()).toBeInstanceOf(ApolloClient)
  })
})
