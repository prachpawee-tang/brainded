const DEFAULT_API_ORIGIN = 'http://localhost:4000'
/** Build value meaning "the API is on the same origin as the web page" (one Worker serves both). */
const SAME_ORIGIN = 'same-origin'

export const resolveApiOrigin = (configured: string | undefined, pageOrigin: string | null) => {
  if (configured === SAME_ORIGIN) return pageOrigin ?? DEFAULT_API_ORIGIN
  return configured || DEFAULT_API_ORIGIN
}

const pageOrigin = typeof window !== 'undefined' && window.location ? window.location.origin : null

/** Origin of apps/api. Auth lives at `${API_ORIGIN}/api/auth`, GraphQL at `${API_ORIGIN}/graphql`. */
export const API_ORIGIN = resolveApiOrigin(process.env.EXPO_PUBLIC_API_ORIGIN, pageOrigin)
export const GRAPHQL_URL = `${API_ORIGIN}/graphql`
export const APP_SCHEME = 'brain'
