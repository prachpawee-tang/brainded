import type { ReminderSettings } from '@brain/core'
import { Switch, Text } from '@brain/ui'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import * as notifications from '../notifications'
import { updateReminderSettings, useReminderSettings } from '../reminder-settings'

const KINDS = [
  'doses',
  'appointments',
  'tasks',
] as const satisfies readonly (keyof ReminderSettings)[]

const Row = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) => (
  <View className="flex-row items-center justify-between gap-3">
    <Text className="flex-1">{label}</Text>
    <Switch label={label} value={value} onValueChange={onChange} />
  </View>
)

/** Per-device reminder switches. Turning on asks the OS for permission first. */
export const NotificationSettings = () => {
  const { t } = useTranslation('app')
  const { settings, isLoaded } = useReminderSettings()
  const [isDenied, setIsDenied] = useState(false)

  if (!notifications.IS_NOTIFICATIONS_SUPPORTED)
    return <Text tone="muted">{t('settings.notifications.webNote')}</Text>
  if (!isLoaded) return null

  const toggleMaster = async (isEnabled: boolean) => {
    if (isEnabled && !(await notifications.requestNotificationPermission()))
      return setIsDenied(true)
    setIsDenied(false)
    await updateReminderSettings({ isEnabled })
  }

  return (
    <>
      <Row
        label={t('settings.notifications.master')}
        value={settings.isEnabled}
        onChange={toggleMaster}
      />
      {isDenied ? (
        <Text variant="caption" tone="danger">
          {t('settings.notifications.denied')}
        </Text>
      ) : null}
      {settings.isEnabled
        ? KINDS.map((kind) => (
            <Row
              key={kind}
              label={t(`settings.notifications.${kind}`)}
              value={settings[kind]}
              onChange={(value) => updateReminderSettings({ [kind]: value })}
            />
          ))
        : null}
    </>
  )
}
