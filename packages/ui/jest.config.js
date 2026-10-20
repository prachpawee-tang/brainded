/** @type {import('jest').Config} */
export default {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.ts', '!src/**/*.test.{ts,tsx}'],
  coverageThreshold: { global: { lines: 80, branches: 80, functions: 80, statements: 80 } },
}
