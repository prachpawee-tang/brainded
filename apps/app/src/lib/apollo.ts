import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { Platform } from 'react-native'
import { GRAPHQL_URL } from './config'

export type CookieSource = () => string | null | undefined | Promise<string | null | undefined>

/**
 * Web sends the session cookie automatically (`credentials: include`).
 * Native has no cookie jar, so we attach the cookie Better Auth keeps in SecureStore.
 */
export const createApolloClient = ({
  uri = GRAPHQL_URL,
  getCookie,
}: {
  uri?: string
  getCookie?: CookieSource
} = {}) => {
  const http = new HttpLink({ uri, credentials: Platform.OS === 'web' ? 'include' : 'omit' })
  const auth = new SetContextLink(async (prevContext) => {
    const cookie = Platform.OS === 'web' ? null : await getCookie?.()
    return cookie ? { headers: { ...prevContext.headers, cookie } } : {}
  })
  return new ApolloClient({ link: auth.concat(http), cache: new InMemoryCache() })
}
