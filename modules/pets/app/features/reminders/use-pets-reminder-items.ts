import { useQuery } from '@apollo/client/react'
import type { ReminderItem, ReminderSettings } from '@brain/core'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { type PlannedReminder, planPetReminders } from '../../../shared/reminders'
import { PetsReminderSourcesQuery } from '../../graphql/tasks'

/**
 * Pets' contribution to the device's local notifications (the app shell schedules them).
 * `null` while the data is unknown (loading, offline), so the shell keeps what is already scheduled.
 */
export const usePetsReminderItems = (settings: ReminderSettings): ReminderItem[] | null => {
  const { t } = useTranslation('pets')
  const { data } = useQuery(PetsReminderSourcesQuery, { skip: !settings.isEnabled })

  return useMemo(() => {
    if (!settings.isEnabled) return []
    if (!data) return null
    const pets = data.pets.edges.map((edge) => edge.node)
    const text = (r: PlannedReminder) => {
      if (r.kind === 'DOSE')
        return {
          title: t('reminders.doseTitle', { pet: r.petName, name: r.subject }),
          body: r.detail
            ? t('reminders.doseBody', { detail: r.detail })
            : t('reminders.doseBodyPlain'),
        }
      if (r.kind === 'APPOINTMENT')
        return {
          title: t('reminders.appointmentTitle', { pet: r.petName, reason: r.subject }),
          body: t(r.detail === '1d' ? 'reminders.appointment1d' : 'reminders.appointment2h'),
        }
      return {
        title: t('reminders.taskTitle', { pet: r.petName, title: r.subject }),
        body: t('reminders.taskBody'),
      }
    }
    return planPetReminders({ pets, now: new Date(), kinds: settings }).map((r) => ({
      id: r.id,
      at: r.at,
      route: `/pets/${r.petId}`,
      ...text(r),
    }))
  }, [data, settings, t])
}
