import { twMerge } from 'tailwind-merge'

/** Join class names; later classes win over conflicting earlier ones. */
export const cn = (...classes: (string | false | null | undefined)[]): string =>
  twMerge(classes.filter(Boolean).join(' '))
