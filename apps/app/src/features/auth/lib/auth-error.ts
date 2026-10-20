const KEYS: Record<string, string> = {
  INVALID_USERNAME_OR_PASSWORD: 'auth.errors.invalidCredentials',
  INVALID_EMAIL_OR_PASSWORD: 'auth.errors.invalidCredentials',
  USER_ALREADY_EXISTS: 'auth.errors.emailTaken',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'auth.errors.emailTaken',
  USERNAME_IS_ALREADY_TAKEN: 'auth.errors.usernameTaken',
  FAILED_TO_UNLINK_LAST_ACCOUNT: 'auth.errors.lastAccount',
}

/** Better Auth error → i18n key (`app` namespace). Never show the server's English message. */
export const authErrorKey = (error: { code?: string | undefined } | null | undefined): string =>
  KEYS[error?.code ?? ''] ?? 'auth.errors.unknown'
