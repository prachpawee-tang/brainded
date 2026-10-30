import { Text } from '@brain/ui'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import type { WadaCombination } from '../../shared/palette'

/** One combination as a strip of its colors; opens the combination. */
export const CombinationStrip = ({ combination }: { combination: WadaCombination }) => {
  const { t } = useTranslation('colors')
  const label = t('combination.number', { n: combination.number })
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[label, ...combination.colors.map((c) => c.name)].join(', ')}
      onPress={() => router.push(`/colors/combinations/${combination.number}`)}
      className="gap-1.5 active:scale-[0.98] active:opacity-90"
    >
      <Text variant="caption" tone="muted" className="font-sans-medium">
        {label}
      </Text>
      <View className="h-14 flex-row overflow-hidden rounded-lg">
        {combination.colors.map((color) => (
          <View key={color.slug} className="flex-1" style={{ backgroundColor: color.hex }} />
        ))}
      </View>
    </Pressable>
  )
}
