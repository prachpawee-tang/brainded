import { useMutation } from '@apollo/client/react'
import {
  Button,
  Checkbox,
  DateField,
  IconButton,
  SegmentedControl,
  Sheet,
  Text,
  TextField,
  toIsoDate,
} from '@brain/ui'
import { Plus, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { medicationInputSchema } from '../../../../shared/health'
import { toValidationIssues } from '../../../../shared/validation'
import type { PetMedicationsQuery } from '../../../graphql/generated/graphql'
import { AddPetMedicationMutation, UpdatePetMedicationMutation } from '../../../graphql/health'
import { issuesToFieldErrors } from '../../../lib/field-errors'
import { isValidTime } from '../../../lib/format'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { repeatLabel } from '../lib/schedule-label'

type Medication = NonNullable<PetMedicationsQuery['pet']>['medications'][number]

type Props = { petId: string; medication?: Medication; visible: boolean; onClose: () => void }

// i18n keys can't contain ':' (namespace separator), so presets are keyed by name.
const PRESETS = [
  { key: 'morning', time: '08:00' },
  { key: 'noon', time: '12:00' },
  { key: 'evening', time: '18:00' },
  { key: 'bedtime', time: '21:00' },
] as const
const PRESET_TIMES: readonly string[] = PRESETS.map((p) => p.time)
const REPEAT_OPTIONS = [1, 2, 7]
const REFETCH = ['PetMedications', 'PetToday', 'PetTimeline']

const initialForm = (medication?: Medication) => ({
  name: medication?.name ?? '',
  dosage: medication?.dosage ?? '',
  times: medication?.times ?? [],
  everyDays: medication?.everyDays ?? 1,
  startOn: medication?.startOn ?? toIsoDate(new Date()),
  endOn: medication?.endOn ?? null,
  note: medication?.note ?? '',
})

export const MedicationSheet = ({ petId, medication, visible, onClose }: Props) => {
  const labels = usePetLabels()
  const { t } = labels
  const [form, setForm] = useState(() => initialForm(medication))
  const [customTime, setCustomTime] = useState('')
  const [customTimeError, setCustomTimeError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [addMedication, add] = useMutation(AddPetMedicationMutation, { refetchQueries: REFETCH })
  const [updateMedication, update] = useMutation(UpdatePetMedicationMutation, {
    refetchQueries: REFETCH,
  })

  useEffect(() => {
    if (visible) {
      setForm(initialForm(medication))
      setErrors({})
    }
  }, [visible, medication])

  const set =
    <K extends keyof typeof form>(key: K) =>
    (value: (typeof form)[K]) =>
      setForm((f) => ({ ...f, [key]: value }))
  const error = (field: string) => (errors[field] ? t(`validation.${errors[field]}`) : undefined)
  const toggleTime = (time: string, isOn: boolean) =>
    set('times')(
      isOn
        ? [...new Set([...form.times, time])].sort()
        : form.times.filter((existing) => existing !== time),
    )

  const addCustomTime = () => {
    const time = customTime.trim()
    if (!isValidTime(time)) return setCustomTimeError(t('validation.INVALID_TIME'))
    setCustomTimeError(null)
    setCustomTime('')
    toggleTime(time, true)
  }

  const repeatOptions = [...new Set([...REPEAT_OPTIONS, form.everyDays])].map((value) => ({
    value: String(value),
    label: repeatLabel(t, value),
  }))

  const save = async () => {
    const parsed = medicationInputSchema.safeParse(form)
    setErrors(issuesToFieldErrors(toValidationIssues(parsed.error)))
    if (!parsed.success) return
    const fields = {
      ...parsed.data,
      dosage: parsed.data.dosage ?? null,
      endOn: parsed.data.endOn ?? null,
      note: parsed.data.note ?? null,
    }
    const { data } = medication
      ? await updateMedication({ variables: { input: { id: medication.id, ...fields } } })
      : await addMedication({ variables: { input: { petId, ...fields } } })
    const payload =
      data && ('updatePetMedication' in data ? data.updatePetMedication : data.addPetMedication)
    if (payload?.__typename === 'ValidationError')
      return setErrors(issuesToFieldErrors(payload.issues))
    if (payload?.__typename?.startsWith('Mutation')) onClose()
  }

  const customTimes = form.times.filter((time) => !PRESET_TIMES.includes(time))

  return (
    <Sheet
      visible={visible}
      title={medication ? t('meds.sheetEdit') : t('meds.sheetNew')}
      closeLabel={t('common.close')}
      onClose={onClose}
    >
      <TextField
        label={t('meds.name')}
        value={form.name}
        onChangeText={set('name')}
        error={error('name')}
      />
      <TextField
        label={t('meds.dosage')}
        value={form.dosage}
        onChangeText={set('dosage')}
        error={error('dosage')}
      />

      <View className="gap-2">
        <Text variant="caption" tone="muted" className="font-sans-medium">
          {t('meds.times')}
        </Text>
        <View className="flex-row flex-wrap gap-x-5 gap-y-3">
          {PRESETS.map(({ key, time }) => {
            const label = `${t(`meds.timePresets.${key}`)} ${time}`
            return (
              <View key={time} className="flex-row items-center gap-2">
                <Checkbox
                  label={label}
                  value={form.times.includes(time)}
                  onValueChange={(isOn) => toggleTime(time, isOn)}
                />
                <Text>{label}</Text>
              </View>
            )
          })}
        </View>
        {customTimes.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {customTimes.map((time) => (
              <Button
                key={time}
                variant="secondary"
                size="sm"
                icon={X}
                label={time}
                accessibilityLabel={t('meds.removeTime', { time })}
                onPress={() => toggleTime(time, false)}
              />
            ))}
          </View>
        ) : null}
        <View className="flex-row items-end gap-2">
          <View className="flex-1">
            <TextField
              label={t('meds.customTime')}
              value={customTime}
              onChangeText={setCustomTime}
              placeholder="14:30"
              keyboardType="numbers-and-punctuation"
              error={customTimeError ?? undefined}
            />
          </View>
          <IconButton
            icon={Plus}
            variant="soft"
            label={t('meds.addTime')}
            onPress={addCustomTime}
            className={customTimeError ? 'mb-7' : 'mb-0.5'}
          />
        </View>
        {error('times') ? (
          <Text accessibilityRole="alert" variant="caption" tone="danger">
            {error('times')}
          </Text>
        ) : null}
      </View>

      <View className="gap-1.5">
        <Text variant="caption" tone="muted" className="font-sans-medium">
          {t('meds.everyDays')}
        </Text>
        <SegmentedControl
          label={t('meds.everyDays')}
          options={repeatOptions}
          value={String(form.everyDays)}
          onChange={(value) => set('everyDays')(Number(value))}
        />
      </View>

      <DateField
        label={t('meds.startOn')}
        value={form.startOn}
        onChange={(value) => set('startOn')(value ?? toIsoDate(new Date()))}
        formatValue={labels.date}
        placeholder={labels.date(form.startOn)}
        error={error('startOn')}
      />
      <DateField
        label={t('meds.endOn')}
        value={form.endOn}
        onChange={set('endOn')}
        formatValue={labels.date}
        placeholder={t('meds.endPlaceholder')}
        clearLabel={t('editor.clear')}
        error={error('endOn')}
      />
      <TextField
        label={t('meds.note')}
        value={form.note}
        onChangeText={set('note')}
        multiline
        error={error('note')}
      />
      <Button label={t('common.save')} onPress={save} loading={add.loading || update.loading} />
    </Sheet>
  )
}
