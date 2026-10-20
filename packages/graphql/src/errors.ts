/**
 * Expected, client-handleable failures. The API returns only `code`s; clients translate them
 * via i18n (`common:errors.<CODE>` or `<module>:errors.<CODE>`). See CLAUDE.md §5.
 */
export class AppError extends Error {
  constructor(
    readonly code: string,
    options?: ErrorOptions,
  ) {
    super(code, options)
    this.name = new.target.name
  }
}

export class NotFoundError extends AppError {
  constructor(code = 'NOT_FOUND') {
    super(code)
  }
}

export class ForbiddenError extends AppError {
  constructor(code = 'FORBIDDEN') {
    super(code)
  }
}

export type ValidationIssue = { path: (string | number)[]; code: string }

export class ValidationError extends AppError {
  constructor(readonly issues: ValidationIssue[]) {
    super('VALIDATION_FAILED')
  }
}
