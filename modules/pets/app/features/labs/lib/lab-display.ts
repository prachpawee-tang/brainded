import type { BadgeTone } from '@brain/ui'
import type { PetLabFlag } from '../../../graphql/generated/graphql'
import { usePetLabels } from '../../../lib/use-pet-labels'

export const FLAG_TONE: Record<PetLabFlag, BadgeTone> = {
  LOW: 'warning',
  HIGH: 'warning',
  ABNORMAL: 'warning',
  NORMAL: 'success',
  UNKNOWN: 'neutral',
}
/** Direction as text, so the flag never relies on color alone. */
const FLAG_ICON: Record<PetLabFlag, string> = {
  LOW: '↓ ',
  HIGH: '↑ ',
  ABNORMAL: '! ',
  NORMAL: '',
  UNKNOWN: '',
}

export const formatLabNumber = (value: number, language: string) =>
  new Intl.NumberFormat(language.startsWith('th') ? 'th-TH' : 'en-GB', {
    maximumFractionDigits: 3,
  }).format(value)

type Rangeable = { refLow?: number | null; refHigh?: number | null }
type Displayable = { value?: number | null; textValue?: string | null; unit?: string | null }

export const useLabDisplay = () => {
  const { t, language } = usePetLabels()
  const n = (value: number) => formatLabNumber(value, language)

  const range = ({ refLow, refHigh }: Rangeable) => {
    if (refLow != null && refHigh != null)
      return t('labs.range', { low: n(refLow), high: n(refHigh) })
    if (refLow != null) return t('labs.rangeLow', { low: n(refLow) })
    if (refHigh != null) return t('labs.rangeHigh', { high: n(refHigh) })
    return null
  }
  /** As printed on the report: "12,200 cells/µL" or "Not Found". */
  const result = ({ value, textValue, unit }: Displayable) =>
    textValue ?? [value == null ? '' : n(value), unit].filter(Boolean).join(' ')
  const flagLabel = (flag: PetLabFlag) => `${FLAG_ICON[flag]}${t(`labs.flags.${flag}`)}`

  return { range, result, flagLabel }
}
