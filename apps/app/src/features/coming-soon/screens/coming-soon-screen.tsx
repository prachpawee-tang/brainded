import { Button, ScreenLayout, Text } from '@brain/ui'
import { ChevronLeft } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { MODULES, useModuleAccent } from '@/lib/modules'
import { goBack } from '@/lib/navigation'

export const ComingSoonScreen = ({ moduleId }: { moduleId: string }) => {
  const module = MODULES.find((m) => m.id === moduleId)
  const { t } = useTranslation([module?.namespace ?? 'app', 'app'])
  const accent = useModuleAccent(moduleId)

  return (
    <ScreenLayout centered>
      <View className="items-center gap-4">
        <View
          className="size-20 items-center justify-center rounded-xl"
          style={{ backgroundColor: accent }}
        >
          <Text className="text-4xl">{module?.icon}</Text>
        </View>
        <Text variant="title">{t('module.name')}</Text>
        <Text tone="muted" className="text-center">
          {t('app:comingSoon')}
        </Text>
        <Button
          variant="ghost"
          icon={ChevronLeft}
          label={t('app:settings.back')}
          onPress={() => goBack('/')}
        />
      </View>
    </ScreenLayout>
  )
}
