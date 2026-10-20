import { vitestPreset } from '@brain/config/vitest'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(
  vitestPreset,
  defineConfig({
    test: {
      coverage: {
        // Table definitions are declarative (their callbacks only run in drizzle-kit);
        // their behavior is covered by *.int.test.ts against the real migrations.
        exclude: ['src/testing/**', 'src/schema/auth.ts', 'src/schema/user-modules.ts'],
      },
    },
  }),
)
