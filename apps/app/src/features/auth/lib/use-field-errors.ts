import { useState } from 'react'
import type { z } from 'zod'
import { toFieldErrors } from './validation'

/** Validates with a zod schema; keeps per-field i18n error keys in state. */
export const useFieldErrors = <S extends z.ZodType>(schema: S) => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const validate = (values: unknown): z.infer<S> | null => {
    const result = schema.safeParse(values)
    setErrors(toFieldErrors(result.error))
    return result.success ? result.data : null
  }
  return { errors, validate }
}
