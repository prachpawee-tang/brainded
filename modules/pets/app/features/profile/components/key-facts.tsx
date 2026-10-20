import { Badge, Text } from '@brain/ui'
import { View } from 'react-native'
import type { PetProfileQuery } from '../../../graphql/generated/graphql'
import { weightDeltaGrams } from '../../../lib/format'
import { usePetLabels } from '../../../lib/use-pet-labels'

type Pet = NonNullable<PetProfileQuery['pet']>

const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View className="gap-1 py-3">
    <Text variant="caption" tone="muted" className="font-sans-medium">
      {label}
    </Text>
    {children}
  </View>
)

/** Everything a vet asks first, readable at a glance. */
export const KeyFacts = ({ pet }: { pet: Pet }) => {
  const labels = usePetLabels()
  const { t } = labels
  const delta = pet.latestWeight ? weightDeltaGrams(pet.latestWeight, pet.previousWeight) : null

  return (
    <View className="rounded-xl border border-border bg-surface px-4">
      <Fact label={t('profile.age')}>
        {pet.birthDate ? (
          <>
            <Text variant="heading">{labels.age(pet.birthDate)}</Text>
            <Text variant="caption" tone="muted">
              {t('profile.born', { date: labels.date(pet.birthDate) })}
            </Text>
          </>
        ) : (
          <Text tone="muted">{t('profile.noBirthday')}</Text>
        )}
      </Fact>
      <View className="h-px bg-border" />
      <Fact label={t('profile.weight')}>
        {pet.latestWeight ? (
          <>
            <View className="flex-row items-center gap-2">
              <Text variant="heading">{labels.kg(pet.latestWeight.weightGrams)}</Text>
              {delta ? <Badge tone="neutral" label={labels.kgDelta(delta)} /> : null}
            </View>
            <Text variant="caption" tone="muted">
              {t('profile.weightOn', { date: labels.date(pet.latestWeight.measuredOn) })}
            </Text>
          </>
        ) : (
          <Text tone="muted">{t('overview.noWeight')}</Text>
        )}
      </Fact>
      <View className="h-px bg-border" />
      <Fact label={t('profile.notes')}>
        {pet.notes ? (
          <Text className="text-warning font-sans-medium">{pet.notes}</Text>
        ) : (
          <Text tone="muted">{t('profile.noNotes')}</Text>
        )}
      </Fact>
    </View>
  )
}
