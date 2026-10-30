import { useQuery } from '@apollo/client/react'
import type { ReminderItem } from '@brain/core'
import { usePetsReminderItems } from '@brain/module-pets/app'
import { router } from 'expo-router'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ViewerQuery } from '@/features/viewer/graphql/viewer'
import {
  configureNotifications,
  replaceScheduledReminders,
  subscribeToReminderTaps,
} from './notifications'
import { useReminderSettings } from './reminder-settings'

const signatureOf = (items: readonly ReminderItem[]) =>
  JSON.stringify(items.map((i) => [i.id, i.at.getTime(), i.title, i.body, i.route]))

/**
 * Keeps this device's local notifications in step with what modules plan.
 * Renders nothing. A `null` from a module means "unknown", which leaves the schedule alone.
 */
export const ReminderSync = () => {
  const { t } = useTranslation('app')
  const { settings, isLoaded } = useReminderSettings()
  const { data } = useQuery(ViewerQuery)
  const isPetsEnabled = data?.viewer
    ? (data.viewer.modules.find((m) => m.moduleId === 'pets')?.enabled ?? true)
    : null
  const petsSettings = useMemo(
    () => ({ ...settings, isEnabled: settings.isEnabled && isPetsEnabled !== false }),
    [settings, isPetsEnabled],
  )
  const petItems = usePetsReminderItems(petsSettings)
  const lastSignature = useRef<string | null>(null)

  useEffect(() => {
    configureNotifications(t('settings.notifications.channel'))
    return subscribeToReminderTaps((route) => router.push(route as never))
  }, [t])

  useEffect(() => {
    if (!isLoaded || isPetsEnabled === null || petItems === null) return
    const items = [...petItems].sort((a, b) => a.at.getTime() - b.at.getTime())
    const signature = signatureOf(items)
    if (signature === lastSignature.current) return
    lastSignature.current = signature
    replaceScheduledReminders(items)
  }, [isLoaded, isPetsEnabled, petItems])

  return null
}
