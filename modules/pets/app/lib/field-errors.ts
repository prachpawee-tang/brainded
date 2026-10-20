import type { z } from 'zod'
import { toValidationIssues } from '../../shared/validation'

/** `{ field: CODE }` from zod errors or server ValidationError issues (first issue per field). */
export const issuesToFieldErrors = (
  issues: readonly { path: readonly (string | number)[]; code: string }[],
) =>
  Object.fromEntries(
    [...issues].reverse().map((issue) => [String(issue.path[0]), issue.code]),
  ) as Record<string, string>

export const zodToFieldErrors = (error: z.ZodError | undefined) =>
  issuesToFieldErrors(toValidationIssues(error))

/** `{ 'values.0.value': CODE }` — full dotted path, for forms with repeated rows. */
export const issuesToPathErrors = (
  issues: readonly { path: readonly (string | number)[]; code: string }[],
) =>
  Object.fromEntries(
    [...issues].reverse().map((issue) => [issue.path.join('.'), issue.code]),
  ) as Record<string, string>
