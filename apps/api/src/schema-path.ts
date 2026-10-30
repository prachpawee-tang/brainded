import { fileURLToPath } from 'node:url'

/** Where codegen writes the SDL. Node-only (import.meta.resolve), so kept out of the runtime schema module. */
export const SCHEMA_PATH = fileURLToPath(import.meta.resolve('@brain/graphql/schema.graphql'))
