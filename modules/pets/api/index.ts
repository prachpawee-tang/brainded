import type { Builder } from '@brain/graphql'
import { registerNotes } from './features/notes/notes.schema'
import { registerProfile } from './features/profile/profile.schema'
import { registerWeight } from './features/weight/weight.schema'

/** Adds the pets module's types, queries and mutations to the shared builder. */
export const registerPetsModule = (builder: Builder) => {
  const Pet = registerProfile(builder)
  registerWeight(builder, Pet)
  registerNotes(builder, Pet)
}
