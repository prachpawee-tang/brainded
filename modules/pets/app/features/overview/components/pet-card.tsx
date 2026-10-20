import { Avatar, Text } from '@brain/ui'
import { Pressable, View } from 'react-native'
import type { PetListQuery } from '../../../graphql/generated/graphql'
import { usePetsAccent } from '../../../lib/accent'
import { speciesEmoji } from '../../../lib/format'
import { usePetLabels } from '../../../lib/use-pet-labels'

type PetCardPet = PetListQuery['pets']['edges'][number]['node']

export const PetCard = ({ pet, onPress }: { pet: PetCardPet; onPress: () => void }) => {
  const labels = usePetLabels()
  const accent = usePetsAccent()
  const subtitle = [labels.species(pet), pet.birthDate ? labels.age(pet.birthDate) : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={pet.name}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-xl border border-border bg-surface p-4 active:scale-[0.98] active:opacity-90"
    >
      <Avatar
        label={pet.name}
        imageUrl={pet.photoUrl}
        fallback={speciesEmoji(pet.species)}
        accentColor={accent}
      />
      <View className="flex-1 gap-0.5">
        <Text variant="heading" numberOfLines={1}>
          {pet.name}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Text
        variant="caption"
        tone={pet.latestWeight ? 'default' : 'muted'}
        className="font-sans-medium"
      >
        {pet.latestWeight ? labels.kg(pet.latestWeight.weightGrams) : labels.t('overview.noWeight')}
      </Text>
    </Pressable>
  )
}
