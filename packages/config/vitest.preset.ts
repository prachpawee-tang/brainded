import { defineConfig } from 'vitest/config'

const COVERAGE_THRESHOLD = 80

// Shared Vitest preset. Packages spread this into their own vitest.config.ts.
// Unit tests: *.test.ts — integration tests: *.int.test.ts (see CLAUDE.md §8)
export const vitestPreset = defineConfig({
  test: {
    environment: 'node',
    // Process GraphQL libs through Vite so they share ONE `graphql` instance with test code
    // (otherwise ESM/CJS copies collide: "Cannot use GraphQLSchema from another module or realm").
    server: { deps: { inline: [/@pothos\//, /graphql-scalars/, /graphql-yoga/, /@graphql-/] } },
    include: ['src/**/*.test.ts'],
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/index.ts', 'src/**/generated/**'],
      thresholds: {
        lines: COVERAGE_THRESHOLD,
        branches: COVERAGE_THRESHOLD,
        functions: COVERAGE_THRESHOLD,
        statements: COVERAGE_THRESHOLD,
      },
    },
  },
})
