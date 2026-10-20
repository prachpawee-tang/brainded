const DEFAULT_API_ORIGIN = 'http://localhost:4000'

/** Origin of apps/api. Auth lives at `${API_ORIGIN}/api/auth`, GraphQL at `${API_ORIGIN}/graphql`. */
export const API_ORIGIN = process.env.EXPO_PUBLIC_API_ORIGIN ?? DEFAULT_API_ORIGIN
export const GRAPHQL_URL = `${API_ORIGIN}/graphql`
export const APP_SCHEME = 'brain'
