/** @type {import('jest').Config} */
export default {
  preset: 'jest-expo',
  // Screens render real i18n + Apollo; leave headroom when turbo runs packages in parallel.
  testTimeout: 30_000,
  testMatch: ['<rootDir>/app/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.test.{ts,tsx}',
    '!app/graphql/generated/**',
    '!app/test/**',
    '!app/index.ts',
  ],
  coverageThreshold: { global: { lines: 80, branches: 80, functions: 80, statements: 80 } },
}
