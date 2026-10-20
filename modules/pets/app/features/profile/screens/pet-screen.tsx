import { useQuery } from '@apollo/client/react'
import { Avatar, Button, EmptyState, ScreenLayout, Skeleton, Text } from '@brain/ui'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { HeaderBar } from '../../../components/header-bar'
import { PetProfileQuery } from '../../../graphql/pets'
import { usePetsAccent } from '../../../lib/accent'
import { speciesEmoji } from '../../../lib/format'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { LabResultsSection } from '../../labs/components/lab-results-section'
import { NoteSheet } from '../../logging/components/note-sheet'
import { WeightSheet } from '../../logging/components/weight-sheet'
import { TodayCard } from '../../today/components/today-card'
import { WeightTrendCard } from '../../weight-trend/components/weight-trend-card'
import { KeyFacts } from '../components/key-facts'
import { PetTimeline } from '../components/pet-timeline'

const SAVED_BANNER_MS = 2500

type OpenSheet = 'weight' | 'note' | null

export const PetScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const labels = usePetLabels()
  const { t } = labels
  const accent = usePetsAccent()
  const { data, loading } = useQuery(PetProfileQuery, { variables: { id } })
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null)
  const [isSaved, setIsSaved] = useState(false)
  const pet = data?.pet

  useEffect(() => {
    if (!isSaved) return
    const timer = setTimeout(() => setIsSaved(false), SAVED_BANNER_MS)
    return () => clearTimeout(timer)
  }, [isSaved])

  const onSaved = () => {
    setOpenSheet(null)
    setIsSaved(true)
  }

  if (loading && !data) {
    return (
      <ScreenLayout>
        <Skeleton className="size-28 self-center rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </ScreenLayout>
    )
  }

  if (!pet) {
    return (
      <ScreenLayout centered>
        <EmptyState
          glyph="🔍"
          message={t('profile.notFound')}
          action={{ label: t('common.back'), onPress: () => router.back() }}
        />
      </ScreenLayout>
    )
  }

  const subtitle = [labels.species(pet), pet.breed, labels.sex(pet.sex)].filter(Boolean).join(' · ')

  return (
    <ScreenLayout
      footer={
        <View className="gap-2">
          {isSaved ? (
            <Text
              accessibilityLiveRegion="polite"
              tone="primary"
              className="text-center font-sans-medium"
            >
              {t('common.saved')}
            </Text>
          ) : null}
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              label={t('profile.logWeight')}
              onPress={() => setOpenSheet('weight')}
            />
            <Button
              className="flex-1"
              variant="secondary"
              label={t('profile.addNote')}
              onPress={() => setOpenSheet('note')}
            />
          </View>
        </View>
      }
    >
      <HeaderBar
        backLabel={t('common.back')}
        action={{ label: t('common.edit'), onPress: () => router.push(`/pets/${pet.id}/edit`) }}
      />

      <View className="items-center gap-3">
        <Avatar
          label={pet.name}
          imageUrl={pet.photoUrl}
          fallback={speciesEmoji(pet.species)}
          accentColor={accent}
          size="xl"
        />
        <View className="items-center gap-1">
          <Text variant="display" className="text-center">
            {pet.name}
          </Text>
          <Text tone="muted" className="text-center">
            {subtitle}
          </Text>
        </View>
      </View>

      <View className="gap-3">
        <Text variant="heading">{t('profile.keyFacts')}</Text>
        <KeyFacts pet={pet} />
      </View>

      <TodayCard petId={pet.id} />
      <WeightTrendCard petId={pet.id} />
      <LabResultsSection petId={pet.id} />

      <View className="gap-3">
        <Text variant="heading">{t('profile.timeline')}</Text>
        <PetTimeline petId={pet.id} />
      </View>

      <WeightSheet
        petId={pet.id}
        visible={openSheet === 'weight'}
        onClose={() => setOpenSheet(null)}
        onSaved={onSaved}
      />
      <NoteSheet
        petId={pet.id}
        visible={openSheet === 'note'}
        onClose={() => setOpenSheet(null)}
        onSaved={onSaved}
      />
    </ScreenLayout>
  )
}
