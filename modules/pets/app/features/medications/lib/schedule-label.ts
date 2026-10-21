import type { TFunction } from 'i18next'

const DAILY = 1
const WEEKLY = 7

export const repeatLabel = (t: TFunction, everyDays: number) => {
  if (everyDays === DAILY) return t('meds.daily')
  if (everyDays === WEEKLY) return t('meds.weekly')
  return t('meds.everyN', { count: everyDays })
}

export const scheduleLabel = (
  t: TFunction,
  { times, everyDays }: { times: readonly string[]; everyDays: number },
) => t('meds.schedule', { times: times.join(', '), repeat: repeatLabel(t, everyDays) })
