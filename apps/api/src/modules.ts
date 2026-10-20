import type { ModuleManifest } from '@brain/core'
import { petsModule } from '@brain/module-pets/manifest'

/** Every module the API knows about, in display order. Register new modules here. */
export const MODULES: readonly ModuleManifest[] = [petsModule]
