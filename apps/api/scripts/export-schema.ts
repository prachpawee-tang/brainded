import { writeFileSync } from 'node:fs'
import { printApiSchema } from '../src/schema'
import { SCHEMA_PATH } from '../src/schema-path'

writeFileSync(SCHEMA_PATH, printApiSchema())
console.warn(`schema written → ${SCHEMA_PATH}`)
