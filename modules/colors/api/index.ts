import type { Builder } from '@brain/graphql'
import { registerFavorites } from './features/favorites/favorites.schema'

/** Adds the colors module's types, queries and mutations to the shared builder. */
export const registerColorsModule = (builder: Builder) => {
  registerFavorites(builder)
}
