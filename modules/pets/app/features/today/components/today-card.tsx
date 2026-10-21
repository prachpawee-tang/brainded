import { useMutation, useQuery } from '@apollo/client/react'
import { Checkbox, Icon, ListItem, Skeleton, Text, toIsoDate } from '@brain/ui'
import { router } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { View } from 'react-native'
import { PetTodayQuery, SetDoseTakenMutation } from '../../../graphql/health'
import { usePetLabels } from '../../../lib/use-pet-labels'

/** What needs doing for this pet today: doses to tick off + the next vet visit. */
export const TodayCard = ({ petId }: { petId: string }) => {
  const labels = usePetLabels()
  const { t } = labels
  const date = toIsoDate(new Date())
  const { data, loading } = useQuery(PetTodayQuery, { variables: { id: petId, date } })
  const [setDoseTaken] = useMutation(SetDoseTakenMutation)
  const doses = data?.pet?.dosesOn ?? []
  const next = data?.pet?.nextAppointment

  const toggle = (dose: (typeof doses)[number], taken: boolean) =>
    setDoseTaken({
      variables: { input: { medicationId: dose.medication.id, date, time: dose.time, taken } },
      optimisticResponse: {
        __typename: 'Mutation',
        setDoseTaken: {
          __typename: 'MutationSetDoseTakenSuccess',
          data: {
            __typename: 'PetDose',
            id: dose.id,
            takenAt: taken ? new Date().toISOString() : null,
          },
        },
      },
    })

  if (loading && !data) return <Skeleton className="h-28 rounded-xl" />

  return (
    <View className="gap-3">
      <Text variant="heading">{t('today.title')}</Text>
      <View className="rounded-xl border border-border bg-surface px-4 py-2">
        {doses.length === 0 ? (
          <Text tone="muted" className="py-2">
            {t('today.noDoses')}
          </Text>
        ) : (
          doses.map((dose) => {
            const label = [
              t('today.dose', { time: dose.time, name: dose.medication.name }),
              dose.medication.dosage,
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <View key={dose.id} className="min-h-12 flex-row items-center gap-3">
                <Checkbox
                  label={label}
                  value={Boolean(dose.takenAt)}
                  onValueChange={(taken) => toggle(dose, taken)}
                />
                <Text
                  tone={dose.takenAt ? 'muted' : 'default'}
                  className={dose.takenAt ? 'line-through' : undefined}
                >
                  {label}
                </Text>
              </View>
            )
          })
        )}
        <View className="my-1 h-px bg-border" />
        {next ? (
          <ListItem
            leading={<Text className="text-xl leading-normal">🩺</Text>}
            title={next.reason}
            subtitle={[labels.dateTime(next.scheduledAt), next.clinic].filter(Boolean).join(' · ')}
            accessibilityLabel={`${t('today.nextAppointment')}: ${next.reason}`}
            onPress={() => router.push(`/pets/${petId}/appointments`)}
            trailing={<Icon icon={ChevronRight} tone="muted" />}
          />
        ) : (
          <Text tone="muted" className="py-2">
            {t('today.noAppointment')}
          </Text>
        )}
      </View>
    </View>
  )
}
