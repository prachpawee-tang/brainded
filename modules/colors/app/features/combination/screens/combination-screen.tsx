import { Button, EmptyState, HeaderBar, ScreenLayout, Text } from '@brain/ui'
import { router, useLocalSearchParams } from 'expo-router'
import { Check, Copy, Heart, HeartOff } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { readableTextOn } from '../../../../shared/color-math'
import { getCombination } from '../../../../shared/palette'
import { goBack } from '../../../lib/navigation'
import { useCopy } from '../../../lib/use-copy'
import { useFavorites } from '../../../lib/use-favorites'

/** A combination as large stacked bands: the colors carry the screen. */
export const CombinationScreen = () => {
  const { n } = useLocalSearchParams<{ n: string }>()
  const { t } = useTranslation('colors')
  const { copy, copiedKey } = useCopy()
  const favorites = useFavorites()
  const combination = /^\d+$/.test(n ?? '') ? getCombination(Number(n)) : undefined

  if (!combination) {
    return (
      <ScreenLayout centered>
        <EmptyState
          glyph="🔍"
          message={t('combination.notFound')}
          action={{ label: t('common.back'), onPress: () => goBack('/colors') }}
        />
      </ScreenLayout>
    )
  }

  const ref = String(combination.number)
  const isFavorite = favorites.isFavorite('COMBINATION', ref)
  const isCopied = copiedKey === 'all'

  return (
    <ScreenLayout>
      <HeaderBar
        backLabel={t('common.back')}
        onBack={() => goBack('/colors')}
        actions={[
          {
            label: isFavorite ? t('favorites.remove') : t('favorites.add'),
            icon: isFavorite ? HeartOff : Heart,
            onPress: () => favorites.toggle('COMBINATION', ref),
          },
        ]}
      />
      <Text variant="display">{t('combination.number', { n: combination.number })}</Text>
      <View className="overflow-hidden rounded-xl">
        {combination.colors.map((color) => (
          <Pressable
            key={color.slug}
            accessibilityRole="button"
            accessibilityLabel={`${color.name}, ${color.hex}`}
            onPress={() => router.push(`/colors/${color.slug}`)}
            className="h-32 justify-end p-4 active:opacity-90"
            style={{ backgroundColor: color.hex }}
          >
            <Text className="font-sans-medium" style={{ color: readableTextOn(color.hex) }}>
              {color.name}
            </Text>
            <Text variant="caption" style={{ color: readableTextOn(color.hex) }}>
              {color.hex}
            </Text>
          </Pressable>
        ))}
      </View>
      <Button
        variant="secondary"
        icon={isCopied ? Check : Copy}
        label={isCopied ? t('codes.copied') : t('combination.copyAll')}
        accessibilityLabel={t('combination.copyAll')}
        onPress={() => copy('all', combination.colors.map((c) => c.hex).join(' '))}
      />
    </ScreenLayout>
  )
}
