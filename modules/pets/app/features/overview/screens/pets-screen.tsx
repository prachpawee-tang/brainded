import { useQuery } from '@apollo/client/react'
import { Button, EmptyState, ScreenLayout, Skeleton, Text } from '@brain/ui'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { HeaderBar } from '../../../components/header-bar'
import { PetListQuery } from '../../../graphql/pets'
import { PetCard } from '../components/pet-card'

const SHORTCUTS = [
  { species: 'DOG', key: 'overview.emptyAddDog' },
  { species: 'CAT', key: 'overview.emptyAddCat' },
  { species: 'OTHER', key: 'overview.emptyAddOther' },
] as const

const LOADING_KEYS = ['a', 'b']

export const PetsScreen = () => {
  const { t } = useTranslation('pets')
  const { data, loading, error, refetch } = useQuery(PetListQuery)
  const pets = data?.pets.edges.map((edge) => edge.node) ?? []

  const body = () => {
    if (loading && !data) {
      return (
        <View testID="pets-loading" className="gap-3">
          {LOADING_KEYS.map((key) => (
            <Skeleton key={key} className="h-20 rounded-xl" />
          ))}
        </View>
      )
    }
    if (error && !data) {
      return (
        <EmptyState
          glyph="🙀"
          message={t('overview.error')}
          action={{ label: t('common.retry'), onPress: () => refetch() }}
        />
      )
    }
    if (pets.length === 0) {
      return (
        <View className="gap-3">
          <EmptyState glyph="🐾" message={t('overview.emptyMessage')} />
          <View className="flex-row flex-wrap justify-center gap-2">
            {SHORTCUTS.map(({ species, key }) => (
              <Button
                key={species}
                variant="secondary"
                size="sm"
                label={t(key)}
                onPress={() => router.push({ pathname: '/pets/new', params: { species } })}
              />
            ))}
          </View>
        </View>
      )
    }
    return (
      <View className="gap-3">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} onPress={() => router.push(`/pets/${pet.id}`)} />
        ))}
        <Button
          variant="secondary"
          label={t('overview.add')}
          onPress={() => router.push('/pets/new')}
        />
      </View>
    )
  }

  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} fallbackHref="/" />
      <Text variant="display">{t('overview.title')}</Text>
      {body()}
    </ScreenLayout>
  )
}
