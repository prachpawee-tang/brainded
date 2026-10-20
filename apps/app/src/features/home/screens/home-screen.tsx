import { useQuery } from '@apollo/client/react'
import { Text } from '@brain/ui'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ApiHealthQuery } from '../graphql/health'

type ApiState = 'checking' | 'online' | 'offline'

const DOT_CLASSES: Record<ApiState, string> = {
  checking: 'bg-warning',
  online: 'bg-success',
  offline: 'bg-danger',
}

const useApiState = (): ApiState => {
  const { data, error } = useQuery(ApiHealthQuery, { fetchPolicy: 'network-only' })
  if (error) return 'offline'
  return data ? 'online' : 'checking'
}

export const HomeScreen = () => {
  const { t } = useTranslation('app')
  const insets = useSafeAreaInsets()
  const apiState = useApiState()

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="gap-8 px-6 pb-12"
      contentContainerStyle={{ paddingTop: insets.top + 32 }}
    >
      <View className="gap-2">
        <Text variant="display">{t('home.greeting')}</Text>
        <Text tone="muted">{t('home.tagline')}</Text>
      </View>

      <View className="flex-row items-center gap-2 self-start rounded-full bg-surface px-3 py-1.5 border border-border">
        <View className={`size-2 rounded-full ${DOT_CLASSES[apiState]}`} />
        <Text variant="caption" tone="muted">
          {t(`home.api.${apiState}`)}
        </Text>
      </View>

      <View className="gap-3">
        <Text variant="heading">{t('home.modulesTitle')}</Text>
        <View className="rounded-xl bg-surface p-5 border border-border">
          <View className="mb-3 size-10 rounded-lg bg-module-pets" />
          <Text tone="muted">{t('home.petsComingSoon')}</Text>
        </View>
      </View>
    </ScrollView>
  )
}
