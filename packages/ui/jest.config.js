/** @type {import('jest').Config} */
export default {
  preset: 'jest-expo',
  // Screens render real i18n + Apollo; leave headroom when turbo runs packages in parallel.
  testTimeout: 30_000,
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/**/*.web.tsx',
    '!src/**/*.types.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
  coverageThreshold: { global: { lines: 80, branches: 80, functions: 80, statements: 80 } },
}
