import type { Database } from '@brain/db'
import type { ObjectStorage } from '@brain/storage'

/** The signed-in user. Populated by the auth layer (Phase 1). */
export type Viewer = { id: string }

export type GraphQLContext = {
  db: Database
  storage: ObjectStorage
  viewer: Viewer | null
  requestId: string
}
