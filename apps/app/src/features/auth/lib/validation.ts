import { z } from 'zod'

/** Messages are i18n keys in the `app` namespace — translated at render time. */
const REQUIRED = 'auth.validation.required'
const USERNAME_PATTERN = /^[a-z0-9_.]{3,30}$/

export const signInSchema = z.object({
  /** Username or email. */
  identifier: z.string().trim().min(1, REQUIRED),
  password: z.string().min(1, REQUIRED),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(1, REQUIRED),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_PATTERN, 'auth.validation.usernameFormat'),
  email: z.email('auth.validation.email'),
  password: z.string().min(10, 'auth.validation.passwordLength'),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>

/** First error per field, as i18n keys. */
export const toFieldErrors = (error: z.ZodError | undefined): Record<string, string> =>
  Object.fromEntries(
    (error?.issues ?? []).reverse().map((issue) => [String(issue.path[0]), issue.message]),
  )
