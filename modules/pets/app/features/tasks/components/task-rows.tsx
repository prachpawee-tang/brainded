import { Checkbox, cn, Text, toIsoDate } from '@brain/ui'
import { Pressable, View } from 'react-native'
import { usePetLabels } from '../../../lib/use-pet-labels'

type TaskRow = { id: string; title: string; dueOn?: string | null; completedAt?: string | null }

type Props<T extends TaskRow> = {
  tasks: T[]
  onToggle: (task: T, done: boolean) => void
  onPress?: (task: T) => void
}

/** Tick box + title (tap to edit) + due label. Overdue dates use the danger tone. */
export const TaskRows = <T extends TaskRow>({ tasks, onToggle, onPress }: Props<T>) => {
  const labels = usePetLabels()
  const { t } = labels
  const today = toIsoDate(new Date())

  const dueLabel = (task: T) => {
    if (!task.dueOn) return null
    if (task.completedAt) return t('tasks.due', { date: labels.date(task.dueOn) })
    if (task.dueOn < today) return t('tasks.overdue', { date: labels.date(task.dueOn) })
    if (task.dueOn === today) return t('tasks.dueToday')
    return t('tasks.due', { date: labels.date(task.dueOn) })
  }

  return tasks.map((task) => {
    const isDone = Boolean(task.completedAt)
    const isOverdue = !isDone && Boolean(task.dueOn) && (task.dueOn as string) < today
    const due = dueLabel(task)
    return (
      <View key={task.id} className="min-h-12 flex-row items-center gap-3">
        <Checkbox
          label={task.title}
          value={isDone}
          onValueChange={(done) => onToggle(task, done)}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={task.title}
          disabled={!onPress}
          onPress={() => onPress?.(task)}
          className="flex-1 py-2 active:opacity-70"
        >
          <Text tone={isDone ? 'muted' : 'default'} className={isDone ? 'line-through' : undefined}>
            {task.title}
          </Text>
          {due ? (
            <Text
              variant="caption"
              tone={isOverdue ? 'danger' : 'muted'}
              className={cn(isOverdue && 'font-sans-medium')}
            >
              {due}
            </Text>
          ) : null}
        </Pressable>
      </View>
    )
  })
}
