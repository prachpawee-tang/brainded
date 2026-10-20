import { writeFileSync } from 'node:fs'
import { printApiSchema, SCHEMA_PATH } from '../src/schema'

writeFileSync(SCHEMA_PATH, printApiSchema())
console.warn(`schema written → ${SCHEMA_PATH}`)
