import { useMutation } from '@apollo/client/react'
import { Button, DateField, Sheet, TextField } from '@brain/ui'
import { Trash2 } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { taskInputSchema } from '../../../../shared/health'
import {
  AddPetTaskMutation,
  DeletePetTaskMutation,
  UpdatePetTaskMutation,
} from '../../../graphql/tasks'
import { confirmAction } from '../../../lib/confirm'
import { issuesToFieldErrors, zodToFieldErrors } from '../../../lib/field-errors'
import { usePetLabels } from '../../../lib/use-pet-labels'
import type { Task } from '../lib/types'

type Props = { petId: string; task?: Task; visible: boolean; onClose: () => void }

const REFETCH = ['PetTasks', 'PetToday', 'PetsReminderSources']

const initialForm = (task?: Task) => ({
  title: task?.title ?? '',
  note: task?.note ?? '',
  dueOn: task?.dueOn ?? null,
})

export const TaskSheet = ({ petId, task, visible, onClose }: Props) => {
  const labels = usePetLabels()
  const { t } = labels
  const [form, setForm] = useState(() => initialForm(task))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [addTask, add] = useMutation(AddPetTaskMutation, { refetchQueries: REFETCH })
  const [updateTask, update] = useMutation(UpdatePetTaskMutation, { refetchQueries: REFETCH })
  const [deleteTask] = useMutation(DeletePetTaskMutation, { refetchQueries: REFETCH })

  useEffect(() => {
    if (visible) {
      setForm(initialForm(task))
      setErrors({})
    }
  }, [visible, task])

  const error = (field: string) => (errors[field] ? t(`validation.${errors[field]}`) : undefined)

  const save = async () => {
    const parsed = taskInputSchema.safeParse(form)
    setErrors(zodToFieldErrors(parsed.error))
    if (!parsed.success) return
    const fields = {
      title: parsed.data.title,
      note: parsed.data.note ?? null,
      dueOn: parsed.data.dueOn ?? null,
    }
    const { data } = task
      ? await updateTask({ variables: { input: { id: task.id, ...fields } } })
      : await addTask({ variables: { input: { petId, ...fields } } })
    const payload = data && ('updatePetTask' in data ? data.updatePetTask : data.addPetTask)
    if (payload?.__typename === 'ValidationError')
      return setErrors(issuesToFieldErrors(payload.issues))
    if (payload?.__typename?.startsWith('Mutation')) onClose()
  }

  const remove = async () => {
    if (!task) return
    const isConfirmed = await confirmAction(t('tasks.deleteConfirm'), {
      confirm: t('tasks.delete'),
      cancel: t('common.back'),
    })
    if (!isConfirmed) return
    await deleteTask({ variables: { input: { id: task.id } } })
    onClose()
  }

  return (
    <Sheet
      visible={visible}
      title={task ? t('tasks.sheetEdit') : t('tasks.sheetNew')}
      closeLabel={t('common.close')}
      onClose={onClose}
    >
      <TextField
        label={t('tasks.name')}
        value={form.title}
        onChangeText={(title) => setForm((f) => ({ ...f, title }))}
        error={error('title')}
      />
      <DateField
        label={t('tasks.dueOn')}
        value={form.dueOn}
        onChange={(dueOn) => setForm((f) => ({ ...f, dueOn }))}
        formatValue={labels.date}
        placeholder={t('tasks.duePlaceholder')}
        clearLabel={t('editor.clear')}
        error={error('dueOn')}
      />
      <TextField
        label={t('tasks.note')}
        value={form.note}
        onChangeText={(note) => setForm((f) => ({ ...f, note }))}
        multiline
        error={error('note')}
      />
      <Button label={t('common.save')} onPress={save} loading={add.loading || update.loading} />
      {task ? (
        <Button variant="ghost" icon={Trash2} label={t('tasks.delete')} onPress={remove} />
      ) : null}
    </Sheet>
  )
}
