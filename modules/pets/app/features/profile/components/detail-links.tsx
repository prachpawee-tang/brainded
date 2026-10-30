import { useQuery } from '@apollo/client/react'
import { Icon, ListItem, Text, toIsoDate } from '@brain/ui'
import { router } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { isMedicationActive } from '../../../../shared/health'
import {
  PetAppointmentsQuery,
  PetLabResultsQuery,
  PetMedicationsQuery,
  PetWeightsQuery,
} from '../../../graphql/health'
import { PetTasksQuery } from '../../../graphql/tasks'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { isUpcoming } from '../../appointments/lib/types'
import { LabStatusBadge } from '../../labs/components/lab-status-badge'

type RowProps = {
  petId: string
  path: string
  glyph: string
  title: string
  summary: string | null
  badge?: ReactNode
}

const DetailRow = ({ petId, path, glyph, title, summary, badge }: RowProps) => (
  <ListItem
    leading={<Text className="text-xl leading-normal">{glyph}</Text>}
    title={title}
    subtitle={summary}
    accessibilityLabel={summary ? `${title}, ${summary}` : title}
    onPress={() => router.push(`/pets/${petId}/${path}`)}
    trailing={
      <View className="flex-row items-center gap-2">
        {badge}
        <Icon icon={ChevronRight} tone="muted" />
      </View>
    }
  />
)

const WeightRow = ({ petId }: { petId: string }) => {
  const { t } = usePetLabels()
  const { data } = useQuery(PetWeightsQuery, { variables: { id: petId } })
  const count = data?.pet?.weights.length
  const summary =
    count === undefined
      ? null
      : count === 0
        ? t('overview.noWeight')
        : t('details.weightCount', { count })
  return (
    <DetailRow petId={petId} path="weights" glyph="⚖️" title={t('weight.title')} summary={summary} />
  )
}

const LabsRow = ({ petId }: { petId: string }) => {
  const labels = usePetLabels()
  const { t } = labels
  const { data } = useQuery(PetLabResultsQuery, { variables: { id: petId, first: 1 } })
  const latest = data?.pet?.labResults[0]
  const summary = !data
    ? null
    : latest
      ? t('details.labsLatest', { title: latest.title, date: labels.date(latest.takenOn) })
      : t('details.labsEmpty')
  return (
    <DetailRow
      petId={petId}
      path="labs"
      glyph="🧪"
      title={t('labs.title')}
      summary={summary}
      badge={
        latest && latest.abnormalCount > 0 ? (
          <LabStatusBadge abnormalCount={latest.abnormalCount} />
        ) : null
      }
    />
  )
}

const MedicationsRow = ({ petId }: { petId: string }) => {
  const { t } = usePetLabels()
  const { data } = useQuery(PetMedicationsQuery, { variables: { id: petId } })
  const today = toIsoDate(new Date())
  const count = data?.pet?.medications.filter((m) => isMedicationActive(m, today)).length
  const summary =
    count === undefined ? null : count === 0 ? t('meds.empty') : t('details.medsActive', { count })
  return (
    <DetailRow
      petId={petId}
      path="medications"
      glyph="💊"
      title={t('meds.title')}
      summary={summary}
    />
  )
}

const AppointmentsRow = ({ petId }: { petId: string }) => {
  const labels = usePetLabels()
  const { t } = labels
  const { data } = useQuery(PetAppointmentsQuery, { variables: { id: petId } })
  const next = data?.pet?.appointments.find((a) => isUpcoming(a))
  const summary = !data
    ? null
    : next
      ? t('details.nextAppointment', { when: labels.dateTime(next.scheduledAt) })
      : t('appointments.empty')
  return (
    <DetailRow
      petId={petId}
      path="appointments"
      glyph="🩺"
      title={t('appointments.title')}
      summary={summary}
    />
  )
}

const TasksRow = ({ petId }: { petId: string }) => {
  const { t } = usePetLabels()
  const { data } = useQuery(PetTasksQuery, { variables: { id: petId } })
  const count = data?.pet?.tasks.length
  const summary =
    count === undefined ? null : count === 0 ? t('tasks.empty') : t('details.tasksOpen', { count })
  return (
    <DetailRow petId={petId} path="tasks" glyph="📝" title={t('tasks.title')} summary={summary} />
  )
}

/** The profile's way into the deeper pages: one row per page, each with a one-line summary. */
export const DetailLinks = ({ petId }: { petId: string }) => {
  const { t } = usePetLabels()
  return (
    <View className="gap-3">
      <Text variant="heading">{t('details.title')}</Text>
      <View className="rounded-xl border border-border bg-surface px-4">
        <WeightRow petId={petId} />
        <LabsRow petId={petId} />
        <MedicationsRow petId={petId} />
        <AppointmentsRow petId={petId} />
        <TasksRow petId={petId} />
        <DetailRow
          petId={petId}
          path="history"
          glyph="📖"
          title={t('profile.timeline')}
          summary={t('details.historyHint')}
        />
      </View>
    </View>
  )
}
