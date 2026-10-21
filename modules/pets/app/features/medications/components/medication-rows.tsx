import { ListItem, Text } from '@brain/ui'
import type { PetMedicationsQuery } from '../../../graphql/generated/graphql'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { scheduleLabel } from '../lib/schedule-label'

export type Medication = NonNullable<PetMedicationsQuery['pet']>['medications'][number]

export const MedicationRows = ({
  medications,
  onPress,
}: {
  medications: readonly Medication[]
  onPress: (m: Medication) => void
}) => {
  const labels = usePetLabels()
  const { t } = labels
  return (
    <>
      {medications.map((medication) => (
        <ListItem
          key={medication.id}
          leading={<Text className="text-xl leading-normal">💊</Text>}
          title={[medication.name, medication.dosage].filter(Boolean).join(' · ')}
          accessibilityLabel={medication.name}
          subtitle={[
            scheduleLabel(t, medication),
            medication.endOn ? t('meds.endsOn', { date: labels.date(medication.endOn) }) : null,
          ]
            .filter(Boolean)
            .join(' ')}
          onPress={() => onPress(medication)}
        />
      ))}
    </>
  )
}
