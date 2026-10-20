import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const DEFAULT_API_URL = 'http://localhost:4000/graphql'

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL

export const createApolloClient = (uri: string = API_URL) =>
  new ApolloClient({
    link: new HttpLink({ uri, credentials: 'include' }),
    cache: new InMemoryCache(),
  })
