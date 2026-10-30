import { EmptyState, HeaderBar, ScreenLayout, Text } from '@brain/ui'
import { useLocalSearchParams } from 'expo-router'
import { Heart, HeartOff } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { findColor, getCombination } from '../../../../shared/palette'
import { CombinationStrip } from '../../../components/combination-strip'
import { CopyRow } from '../../../components/copy-row'
import { goBack } from '../../../lib/navigation'
import { useCopy } from '../../../lib/use-copy'
import { useFavorites } from '../../../lib/use-favorites'

export const ColorScreen = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { t } = useTranslation('colors')
  const { copy, copiedKey } = useCopy()
  const favorites = useFavorites()
  const color = findColor(slug)

  if (!color) {
    return (
      <ScreenLayout centered>
        <EmptyState
          glyph="🔍"
          message={t('color.notFound')}
          action={{ label: t('common.back'), onPress: () => goBack('/colors') }}
        />
      </ScreenLayout>
    )
  }

  const isFavorite = favorites.isFavorite('COLOR', color.slug)
  const codes = [
    { key: 'hex', value: color.hex, text: color.hex },
    { key: 'rgb', value: color.rgb.join(', '), text: `rgb(${color.rgb.join(', ')})` },
    { key: 'cmyk', value: color.cmyk.join(', '), text: `cmyk(${color.cmyk.join(', ')})` },
  ] as const

  return (
    <ScreenLayout>
      <HeaderBar
        backLabel={t('common.back')}
        onBack={() => goBack('/colors')}
        actions={[
          {
            label: isFavorite ? t('favorites.remove') : t('favorites.add'),
            icon: isFavorite ? HeartOff : Heart,
            onPress: () => favorites.toggle('COLOR', color.slug),
          },
        ]}
      />
      <View
        className="h-48 rounded-xl border border-border"
        style={{ backgroundColor: color.hex }}
      />
      <Text variant="display">{color.name}</Text>
      <View className="rounded-xl border border-border bg-surface px-4">
        {codes.map((code) => (
          <CopyRow
            key={code.key}
            label={t(`codes.${code.key}`)}
            value={code.value}
            isCopied={copiedKey === code.key}
            onCopy={() => copy(code.key, code.text)}
          />
        ))}
      </View>
      <View className="gap-4">
        <Text variant="heading">{t('color.usedIn', { count: color.combinations.length })}</Text>
        {color.combinations.map((n) => {
          const combination = getCombination(n)
          return combination ? <CombinationStrip key={n} combination={combination} /> : null
        })}
      </View>
    </ScreenLayout>
  )
}
