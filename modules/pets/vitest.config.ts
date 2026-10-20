import { vitestPreset } from '@brain/config/vitest'
import { defineConfig, mergeConfig } from 'vitest/config'

// Vitest covers the isomorphic `shared/` code and the server `api/`. The `app/` screens use Jest.
export default mergeConfig(
  vitestPreset,
  defineConfig({
    test: {
      include: ['src/**/*.test.ts', 'shared/**/*.test.ts', 'api/**/*.test.ts'],
      coverage: {
        include: ['src/**/*.ts', 'shared/**/*.ts', 'api/**/*.ts'],
        exclude: ['**/*.test.ts', '**/index.ts', 'api/db/schema.ts', 'api/test/**'],
      },
    },
  }),
)
