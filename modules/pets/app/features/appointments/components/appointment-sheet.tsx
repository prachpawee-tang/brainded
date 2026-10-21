import { useMutation } from '@apollo/client/react'
import { Button, DateField, Sheet, Text, TextField, toIsoDate } from '@brain/ui'
import { router } from 'expo-router'
import { Check, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { appointmentInputSchema } from '../../../../shared/health'
import { toValidationIssues } from '../../../../shared/validation'
import {
  AddPetAppointmentMutation,
  SetPetAppointmentStatusMutation,
  UpdatePetAppointmentMutation,
} from '../../../graphql/health'
import { confirmAction } from '../../../lib/confirm'
import { issuesToFieldErrors } from '../../../lib/field-errors'
import { isValidTime, localDateTimeToIso } from '../../../lib/format'
import { usePetLabels } from '../../../lib/use-pet-labels'
import type { Appointment } from '../lib/types'

type Props = { petId: string; appointment?: Appointment; visible: boolean; onClose: () => void }

const DEFAULT_TIME = '09:00'
const REFETCH = ['PetAppointments', 'PetToday', 'PetTimeline']
const pad = (n: number) => String(n).padStart(2, '0')

const initialForm = (appointment?: Appointment) => {
  if (!appointment)
    return { date: toIsoDate(new Date()), time: DEFAULT_TIME, reason: '', clinic: '', note: '' }
  const local = new Date(appointment.scheduledAt)
  return {
    date: toIsoDate(local),
    time: `${pad(local.getHours())}:${pad(local.getMinutes())}`,
    reason: appointment.reason,
    clinic: appointment.clinic ?? '',
    note: appointment.note ?? '',
  }
}

export const AppointmentSheet = ({ petId, appointment, visible, onClose }: Props) => {
  const labels = usePetLabels()
  const { t } = labels
  const [form, setForm] = useState(() => initialForm(appointment))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDone, setIsDone] = useState(false)
  const [addAppointment, add] = useMutation(AddPetAppointmentMutation, { refetchQueries: REFETCH })
  const [updateAppointment, update] = useMutation(UpdatePetAppointmentMutation, {
    refetchQueries: REFETCH,
  })
  const [setStatus] = useMutation(SetPetAppointmentStatusMutation, { refetchQueries: REFETCH })

  useEffect(() => {
    if (visible) {
      setForm(initialForm(appointment))
      setErrors({})
      setIsDone(false)
    }
  }, [visible, appointment])

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))
  const error = (field: string) => (errors[field] ? t(`validation.${errors[field]}`) : undefined)

  const save = async () => {
    const timeError: Record<string, string> = isValidTime(form.time) ? {} : { time: 'INVALID_TIME' }
    const parsed = appointmentInputSchema.safeParse({
      scheduledAt: isValidTime(form.time) ? localDateTimeToIso(form.date, form.time) : 'invalid',
      reason: form.reason,
      clinic: form.clinic,
      note: form.note,
    })
    const fieldErrors = issuesToFieldErrors(toValidationIssues(parsed.error))
    delete fieldErrors.scheduledAt
    setErrors({ ...fieldErrors, ...timeError })
    if (!parsed.success || Object.keys(timeError).length > 0) return
    const fields = {
      ...parsed.data,
      clinic: parsed.data.clinic ?? null,
      note: parsed.data.note ?? null,
    }
    const { data } = appointment
      ? await updateAppointment({ variables: { input: { id: appointment.id, ...fields } } })
      : await addAppointment({ variables: { input: { petId, ...fields } } })
    const payload =
      data && ('updatePetAppointment' in data ? data.updatePetAppointment : data.addPetAppointment)
    if (payload?.__typename === 'ValidationError')
      return setErrors(issuesToFieldErrors(payload.issues))
    if (payload?.__typename?.startsWith('Mutation')) onClose()
  }

  const markDone = async () => {
    if (!appointment) return
    await setStatus({
      variables: {
        input: {
          id: appointment.id,
          status: 'DONE',
          localDate: toIsoDate(new Date(appointment.scheduledAt)),
        },
      },
    })
    setIsDone(true)
  }

  const cancel = async () => {
    if (!appointment) return
    const isConfirmed = await confirmAction(t('appointments.cancel'), {
      confirm: t('appointments.cancel'),
      cancel: t('common.back'),
    })
    if (!isConfirmed) return
    await setStatus({ variables: { input: { id: appointment.id, status: 'CANCELLED' } } })
    onClose()
  }

  return (
    <Sheet
      visible={visible}
      title={appointment ? t('appointments.sheetEdit') : t('appointments.sheetNew')}
      closeLabel={t('common.close')}
      onClose={onClose}
    >
      {isDone ? (
        <View className="items-center gap-3 py-4">
          <Text className="text-4xl leading-normal">🎉</Text>
          <Text className="text-center font-sans-medium">{t('appointments.statuses.DONE')}</Text>
          <Button
            label={t('appointments.addResults')}
            onPress={() => {
              onClose()
              router.push(`/pets/${petId}/labs/new`)
            }}
          />
        </View>
      ) : (
        <>
          <View className="flex-row gap-3">
            <View className="flex-[3]">
              <DateField
                label={t('appointments.date')}
                value={form.date}
                onChange={(value) => set('date')(value ?? toIsoDate(new Date()))}
                formatValue={labels.date}
                placeholder={labels.date(form.date)}
              />
            </View>
            <View className="flex-[2]">
              <TextField
                label={t('appointments.time')}
                value={form.time}
                onChangeText={set('time')}
                keyboardType="numbers-and-punctuation"
                error={error('time')}
              />
            </View>
          </View>
          <TextField
            label={t('appointments.reason')}
            value={form.reason}
            onChangeText={set('reason')}
            error={error('reason')}
          />
          <TextField
            label={t('appointments.clinic')}
            value={form.clinic}
            onChangeText={set('clinic')}
            error={error('clinic')}
          />
          <TextField
            label={t('appointments.note')}
            value={form.note}
            onChangeText={set('note')}
            multiline
            error={error('note')}
          />
          <Button label={t('common.save')} onPress={save} loading={add.loading || update.loading} />
          {appointment?.status === 'SCHEDULED' ? (
            <View className="gap-2">
              <Button
                variant="secondary"
                icon={Check}
                label={t('appointments.markDone')}
                onPress={markDone}
              />
              <Button variant="ghost" icon={X} label={t('appointments.cancel')} onPress={cancel} />
            </View>
          ) : null}
        </>
      )}
    </Sheet>
  )
}
