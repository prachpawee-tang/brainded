import { useMutation, useQuery } from '@apollo/client/react'
import { Button, IconButton, ScreenLayout, SegmentedControl, Switch, Text } from '@brain/ui'
import { ChevronLeft, LogOut } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { NotificationSettings } from '@/features/reminders/components/notification-settings'
import {
  SetModuleEnabledMutation,
  UpdatePreferencesMutation,
  ViewerQuery,
} from '@/features/viewer/graphql/viewer'
import type { Language, ThemePreference } from '@/graphql/generated/graphql'
import { authClient } from '@/lib/auth-client'
import { MODULES } from '@/lib/modules'
import { goBack } from '@/lib/navigation'
import { LinkedAccounts } from '../components/linked-accounts'
import { SettingsSection } from '../components/settings-section'

/** Language names are shown in their own language on purpose. */
const LANGUAGE_OPTIONS = [
  { value: 'TH', label: 'ไทย' },
  { value: 'EN', label: 'English' },
] as const satisfies readonly { value: Language; label: string }[]

const THEME_VALUES: readonly ThemePreference[] = ['SYSTEM', 'LIGHT', 'DARK']

const ModuleSwitch = ({
  moduleId,
  namespace,
  enabled,
}: {
  moduleId: string
  namespace: string
  enabled: boolean
}) => {
  const { t } = useTranslation(namespace)
  const [setModuleEnabled] = useMutation(SetModuleEnabledMutation)

  const toggle = (value: boolean) =>
    setModuleEnabled({
      variables: { input: { moduleId, enabled: value } },
      update: (cache, { data }) => {
        const result = data?.setModuleEnabled
        if (result?.__typename !== 'MutationSetModuleEnabledSuccess') return
        cache.updateQuery({ query: ViewerQuery }, (current) =>
          current?.viewer
            ? {
                ...current,
                viewer: {
                  ...current.viewer,
                  modules: current.viewer.modules.map((m) =>
                    m.moduleId === moduleId ? { ...m, enabled: result.data.enabled } : m,
                  ),
                },
              }
            : current,
        )
      },
    })

  return (
    <View className="flex-row items-center justify-between">
      <Text>{t('module.name')}</Text>
      <Switch label={t('module.name')} value={enabled} onValueChange={toggle} />
    </View>
  )
}

export const SettingsScreen = () => {
  const { t } = useTranslation('app')
  const { data } = useQuery(ViewerQuery)
  const [updatePreferences] = useMutation(UpdatePreferencesMutation)
  const viewer = data?.viewer

  if (!viewer) return null

  const themeOptions = THEME_VALUES.map((value) => ({
    value,
    label: t(`settings.themes.${value.toLowerCase()}`),
  }))

  return (
    <ScreenLayout>
      <View className="-ml-3 flex-row items-center gap-1">
        <IconButton icon={ChevronLeft} label={t('settings.back')} onPress={() => goBack('/')} />
        <Text variant="title">{t('settings.title')}</Text>
      </View>

      <View className="gap-1">
        <Text variant="heading">{viewer.name}</Text>
        <Text tone="muted">{viewer.username ? `@${viewer.username}` : ''}</Text>
        <Text variant="caption" tone="muted">
          {viewer.email}
        </Text>
      </View>

      <SettingsSection title={t('settings.language')}>
        <SegmentedControl
          label={t('settings.language')}
          options={LANGUAGE_OPTIONS}
          value={viewer.locale}
          onChange={(locale) => updatePreferences({ variables: { input: { locale } } })}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.theme')}>
        <SegmentedControl
          label={t('settings.theme')}
          options={themeOptions}
          value={viewer.theme}
          onChange={(theme) => updatePreferences({ variables: { input: { theme } } })}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.modules')}>
        {MODULES.map((module) => (
          <ModuleSwitch
            key={module.id}
            moduleId={module.id}
            namespace={module.namespace}
            enabled={viewer.modules.find((m) => m.moduleId === module.id)?.enabled ?? true}
          />
        ))}
      </SettingsSection>

      <SettingsSection title={t('settings.notifications.title')}>
        <NotificationSettings />
      </SettingsSection>

      <SettingsSection title={t('settings.accounts')}>
        <LinkedAccounts />
      </SettingsSection>

      <Button
        variant="ghost"
        icon={LogOut}
        label={t('settings.signOut')}
        onPress={() => authClient.signOut()}
      />
    </ScreenLayout>
  )
}
