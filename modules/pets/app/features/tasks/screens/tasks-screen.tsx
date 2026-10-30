import { useQuery } from '@apollo/client/react'
import { Button, EmptyState, ScreenLayout, Skeleton, Text } from '@brain/ui'
import { useLocalSearchParams } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { View } from 'react-native'
import { HeaderBar } from '../../../components/header-bar'
import { PetTasksQuery } from '../../../graphql/tasks'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { TaskRows } from '../components/task-rows'
import { TaskSheet } from '../components/task-sheet'
import { useTaskSheet } from '../lib/use-task-sheet'
import { useToggleTask } from '../lib/use-toggle-task'

export const TasksScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = usePetLabels()
  const { data, loading } = useQuery(PetTasksQuery, { variables: { id, includeDone: true } })
  const sheet = useTaskSheet()
  const toggle = useToggleTask()
  const all = data?.pet?.tasks ?? []
  const groups = [
    { key: 'open', title: t('tasks.open'), items: all.filter((task) => !task.completedAt) },
    { key: 'done', title: t('tasks.done'), items: all.filter((task) => task.completedAt) },
  ].filter((group) => group.items.length > 0)

  return (
    <ScreenLayout>
      <HeaderBar backLabel={t('common.back')} fallbackHref={`/pets/${id}`} />
      <Text variant="display">{t('tasks.listTitle')}</Text>
      {loading && !data ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : groups.length === 0 ? (
        <EmptyState glyph="📝" message={t('tasks.empty')} />
      ) : (
        groups.map((group) => (
          <View key={group.key} className="gap-2">
            <Text variant="caption" tone="muted" className="font-sans-medium">
              {group.title}
            </Text>
            <View className="rounded-xl border border-border bg-surface px-4">
              <TaskRows
                tasks={group.items}
                onToggle={(task, done) => toggle(task.id, done)}
                onPress={sheet.openEdit}
              />
            </View>
          </View>
        ))
      )}
      <Button icon={Plus} label={t('tasks.add')} onPress={sheet.openNew} />
      <TaskSheet petId={id} task={sheet.task} visible={sheet.visible} onClose={sheet.close} />
    </ScreenLayout>
  )
}
