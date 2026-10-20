import { useQuery } from '@apollo/client/react'
import type { ModuleManifest } from '@brain/core'
import { Button, ScreenLayout, Text, Tile } from '@brain/ui'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { ViewerQuery } from '@/features/viewer/graphql/viewer'
import { MODULES, useModuleAccent } from '@/lib/modules'

const ModuleTile = ({ module }: { module: ModuleManifest }) => {
  const { t } = useTranslation(module.namespace)
  return (
    <Tile
      title={t('module.name')}
      description={t('module.description')}
      icon={module.icon}
      accentColor={useModuleAccent(module.id)}
      onPress={() => router.push(module.route)}
    />
  )
}

export const HomeScreen = () => {
  const { t } = useTranslation('app')
  const { data } = useQuery(ViewerQuery)
  const viewer = data?.viewer
  const enabledIds = new Set(viewer?.modules.filter((m) => m.enabled).map((m) => m.moduleId))
  const modules = MODULES.filter((module) => enabledIds.has(module.id))

  return (
    <ScreenLayout>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <Text variant="display">{t('home.greeting', { name: viewer?.name ?? '' })}</Text>
          <Text tone="muted">{t('home.tagline')}</Text>
        </View>
        <Button
          variant="ghost"
          size="sm"
          label={t('home.settings')}
          onPress={() => router.push('/settings')}
        />
      </View>

      <View className="gap-3">
        <Text variant="heading">{t('home.modulesTitle')}</Text>
        {viewer && modules.length === 0 ? (
          <View className="items-center gap-3 rounded-xl border border-dashed border-border p-8">
            <Text className="text-3xl">🫙</Text>
            <Text tone="muted">{t('home.emptyModules')}</Text>
            <Button
              variant="secondary"
              size="sm"
              label={t('home.openSettings')}
              onPress={() => router.push('/settings')}
            />
          </View>
        ) : (
          modules.map((module) => <ModuleTile key={module.id} module={module} />)
        )}
      </View>
    </ScreenLayout>
  )
}
