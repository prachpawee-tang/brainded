import { useQuery } from '@apollo/client/react'
import { Text, toIsoDate } from '@brain/ui'
import { router } from 'expo-router'
import { isMedicationActive } from '../../../../shared/health'
import { Section } from '../../../components/section'
import { PetMedicationsQuery } from '../../../graphql/health'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { useMedicationSheet } from '../lib/use-medication-sheet'
import { MedicationRows } from './medication-rows'
import { MedicationSheet } from './medication-sheet'

export const MedicationsSection = ({ petId }: { petId: string }) => {
  const { t } = usePetLabels()
  const { data } = useQuery(PetMedicationsQuery, { variables: { id: petId } })
  const sheet = useMedicationSheet()
  const today = toIsoDate(new Date())
  const all = data?.pet?.medications ?? []
  const active = all.filter((m) => isMedicationActive(m, today))

  return (
    <Section
      title={t('meds.title')}
      actions={[
        { label: t('meds.add'), onPress: sheet.openNew },
        ...(all.length > 0
          ? [
              {
                label: t('common.seeAll'),
                onPress: () => router.push(`/pets/${petId}/medications`),
              },
            ]
          : []),
      ]}
    >
      {active.length === 0 ? (
        <Text tone="muted" className="py-2">
          {t('meds.empty')}
        </Text>
      ) : (
        <MedicationRows medications={active} onPress={sheet.openEdit} />
      )}
      <MedicationSheet
        petId={petId}
        medication={sheet.medication}
        visible={sheet.visible}
        onClose={sheet.close}
      />
    </Section>
  )
}
