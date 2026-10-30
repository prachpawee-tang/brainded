import { Button, HeaderBar, ScreenLayout, SegmentedControl, Text, TextField } from '@brain/ui'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { readableTextOn } from '../../../../shared/color-math'
import {
  type ColorMatch,
  listCombinations,
  searchColors,
  WADA_COLORS,
} from '../../../../shared/palette'
import { ColorRow } from '../../../components/color-row'
import { CombinationStrip } from '../../../components/combination-strip'
import { goBack } from '../../../lib/navigation'
import { FavoritesList } from '../../favorites/components/favorites-list'

const PAGE_SIZE = 40
const ALMOST_EXACT = 0.02
const TABS = ['combinations', 'colors', 'favorites'] as const
const SIZES = ['all', '2', '3', '4'] as const
type Tab = (typeof TABS)[number]
type Size = (typeof SIZES)[number]

export const ColorsScreen = () => {
  const { t } = useTranslation('colors')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('combinations')
  const [size, setSize] = useState<Size>('all')
  const [limit, setLimit] = useState(PAGE_SIZE)
  const combinations = listCombinations(size === 'all' ? undefined : Number(size))
  const results = searchColors(query)

  const matchLabel = ({ deltaE }: ColorMatch) => {
    if (Number.isNaN(deltaE)) return undefined
    return deltaE < ALMOST_EXACT
      ? t('match.almostExact')
      : t('match.deltaE', { value: deltaE.toFixed(3) })
  }

  const body = () => {
    if (query.trim()) {
      return results.length === 0 ? (
        <Text tone="muted">{t('browse.noResults')}</Text>
      ) : (
        <View>
          {results.map((r) => (
            <ColorRow key={r.color.slug} color={r.color} match={matchLabel(r)} />
          ))}
        </View>
      )
    }
    if (tab === 'colors') {
      return (
        <View className="flex-row flex-wrap gap-2">
          {WADA_COLORS.map((color) => (
            <Pressable
              key={color.slug}
              accessibilityRole="button"
              accessibilityLabel={color.name}
              onPress={() => router.push(`/colors/${color.slug}`)}
              className="h-24 basis-[31%] grow justify-end rounded-lg p-2 active:scale-95"
              style={{ backgroundColor: color.hex }}
            >
              <Text
                variant="caption"
                numberOfLines={2}
                style={{ color: readableTextOn(color.hex) }}
              >
                {color.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )
    }
    if (tab === 'favorites') return <FavoritesList />
    return (
      <View className="gap-4">
        <SegmentedControl
          label={t('browse.tabs.combinations')}
          options={SIZES.map((value) => ({ value, label: t(`browse.sizes.${value}`) }))}
          value={size}
          onChange={(value) => {
            setSize(value)
            setLimit(PAGE_SIZE)
          }}
        />
        {combinations.slice(0, limit).map((combination) => (
          <CombinationStrip key={combination.number} combination={combination} />
        ))}
        {limit < combinations.length ? (
          <Button
            variant="secondary"
            label={t('browse.showMore')}
            onPress={() => setLimit((n) => n + PAGE_SIZE)}
          />
        ) : null}
      </View>
    )
  }

  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} onBack={() => goBack('/')} />
      <Text variant="display">{t('browse.title')}</Text>
      <TextField
        label={t('browse.search')}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {query.trim() ? null : (
        <SegmentedControl
          label={t('browse.title')}
          options={TABS.map((value) => ({ value, label: t(`browse.tabs.${value}`) }))}
          value={tab}
          onChange={setTab}
        />
      )}
      {body()}
      <Text variant="caption" tone="muted">
        {t('browse.about')}
      </Text>
    </ScreenLayout>
  )
}
