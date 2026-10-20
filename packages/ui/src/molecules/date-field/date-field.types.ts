export type DateFieldProps = {
  label: string
  /** `YYYY-MM-DD` or null. */
  value: string | null
  onChange: (value: string | null) => void
  /** Locale-aware display, supplied by the caller (keeps ui domain/i18n-agnostic). */
  formatValue: (iso: string) => string
  placeholder: string
  /** Shown when set; lets optional dates be cleared. */
  clearLabel?: string
  maximumDate?: Date
  error?: string | undefined
}
