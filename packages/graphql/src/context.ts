import type { Database } from '@brain/db'

/** The signed-in user. Populated by the auth layer (Phase 1). */
export type Viewer = { id: string }

export type GraphQLContext = {
  db: Database
  viewer: Viewer | null
  requestId: string
}
