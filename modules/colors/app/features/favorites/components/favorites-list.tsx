import { EmptyState, Skeleton, Text } from '@brain/ui'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { findColor, getCombination } from '../../../../shared/palette'
import { ColorRow } from '../../../components/color-row'
import { CombinationStrip } from '../../../components/combination-strip'
import { useFavorites } from '../../../lib/use-favorites'

/** Favorite combinations, then favorite colors (newest first within each). */
export const FavoritesList = () => {
  const { t } = useTranslation('colors')
  const { favorites, isLoading } = useFavorites()
  const combinations = favorites.flatMap((f) => {
    const combination = f.kind === 'COMBINATION' ? getCombination(Number(f.ref)) : undefined
    return combination ? [combination] : []
  })
  const colors = favorites.flatMap((f) => {
    const color = f.kind === 'COLOR' ? findColor(f.ref) : undefined
    return color ? [color] : []
  })

  if (isLoading) return <Skeleton className="h-32 rounded-xl" />
  if (combinations.length === 0 && colors.length === 0)
    return <EmptyState glyph="🎨" message={t('favorites.empty')} />

  return (
    <View className="gap-6">
      {combinations.length > 0 ? (
        <View className="gap-4">
          <Text variant="heading">{t('favorites.combinations')}</Text>
          {combinations.map((c) => (
            <CombinationStrip key={c.number} combination={c} />
          ))}
        </View>
      ) : null}
      {colors.length > 0 ? (
        <View className="gap-1">
          <Text variant="heading">{t('favorites.colors')}</Text>
          {colors.map((c) => (
            <ColorRow key={c.slug} color={c} />
          ))}
        </View>
      ) : null}
    </View>
  )
}
