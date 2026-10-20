import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildThemeCss } from '../src/tokens/theme-css'

const target = join(import.meta.dirname, '..', 'theme.css')
writeFileSync(target, buildThemeCss())
console.warn(`theme written → ${target}`)
