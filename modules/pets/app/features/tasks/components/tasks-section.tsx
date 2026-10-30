import { useQuery } from '@apollo/client/react'
import { Text } from '@brain/ui'
import { router } from 'expo-router'
import { ChevronRight, Plus } from 'lucide-react-native'
import { Section } from '../../../components/section'
import { PetTasksQuery } from '../../../graphql/tasks'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { useTaskSheet } from '../lib/use-task-sheet'
import { useToggleTask } from '../lib/use-toggle-task'
import { TaskRows } from './task-rows'
import { TaskSheet } from './task-sheet'

const MAX_OPEN = 5

export const TasksSection = ({ petId }: { petId: string }) => {
  const { t } = usePetLabels()
  const { data } = useQuery(PetTasksQuery, { variables: { id: petId } })
  const sheet = useTaskSheet()
  const toggle = useToggleTask()
  const open = data?.pet?.tasks ?? []

  return (
    <Section
      title={t('tasks.title')}
      actions={[
        { label: t('tasks.add'), icon: Plus, isPrimary: true, onPress: sheet.openNew },
        {
          label: t('common.seeAll'),
          icon: ChevronRight,
          onPress: () => router.push(`/pets/${petId}/tasks`),
        },
      ]}
    >
      {open.length === 0 ? (
        <Text tone="muted" className="py-2">
          {t('tasks.empty')}
        </Text>
      ) : (
        <TaskRows
          tasks={open.slice(0, MAX_OPEN)}
          onToggle={(task, done) => toggle(task.id, done)}
          onPress={sheet.openEdit}
        />
      )}
      <TaskSheet petId={petId} task={sheet.task} visible={sheet.visible} onClose={sheet.close} />
    </Section>
  )
}
