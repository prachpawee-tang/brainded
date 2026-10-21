import { useMutation } from '@apollo/client/react'
import { Button, DateField, ScreenLayout, Text, TextField, toIsoDate } from '@brain/ui'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { LAB_PRESETS, labResultInputSchema } from '../../../../shared/health'
import { toValidationIssues } from '../../../../shared/validation'
import { HeaderBar } from '../../../components/header-bar'
import { PhotoStrip } from '../../../components/photo-strip'
import { AddPetLabResultMutation } from '../../../graphql/health'
import { issuesToPathErrors } from '../../../lib/field-errors'
import { parseDecimal } from '../../../lib/format'
import { usePetLabels } from '../../../lib/use-pet-labels'

type Row = {
  key: number
  name: string
  value: string
  unit: string
  refLow: string
  refHigh: string
}

let nextRowKey = 1
const newRow = (name = '', unit = ''): Row => ({
  key: nextRowKey++,
  name,
  value: '',
  unit,
  refLow: '',
  refHigh: '',
})

export const LabResultEditorScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const labels = usePetLabels()
  const { t } = labels
  const [takenOn, setTakenOn] = useState(() => toIsoDate(new Date()))
  const [title, setTitle] = useState('')
  const [clinic, setClinic] = useState('')
  const [note, setNote] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [photoKeys, setPhotoKeys] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [addResult, { loading }] = useMutation(AddPetLabResultMutation, {
    refetchQueries: ['PetLabResults', 'PetTimeline'],
  })

  const error = (path: string) => (errors[path] ? t(`validation.${errors[path]}`) : undefined)
  const updateRow = (key: number, patch: Partial<Row>) =>
    setRows((current) => current.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const save = async () => {
    const candidate = {
      takenOn,
      title,
      clinic,
      note,
      photoKeys,
      values: rows.map((row) => ({
        name: row.name,
        value: parseDecimal(row.value) ?? Number.NaN,
        unit: row.unit,
        refLow: parseDecimal(row.refLow),
        refHigh: parseDecimal(row.refHigh),
      })),
    }
    const parsed = labResultInputSchema.safeParse(candidate)
    setErrors(issuesToPathErrors(toValidationIssues(parsed.error)))
    if (!parsed.success) return
    const { data } = await addResult({
      variables: {
        input: {
          petId: id,
          ...parsed.data,
          clinic: parsed.data.clinic ?? null,
          note: parsed.data.note ?? null,
          values: parsed.data.values.map((v) => ({
            ...v,
            unit: v.unit ?? null,
            refLow: v.refLow ?? null,
            refHigh: v.refHigh ?? null,
          })),
        },
      },
    })
    const payload = data?.addPetLabResult
    if (payload?.__typename === 'ValidationError')
      return setErrors(issuesToPathErrors(payload.issues))
    if (payload?.__typename === 'MutationAddPetLabResultSuccess')
      router.replace(`/pets/${id}/labs/${payload.data.id}`)
  }

  return (
    <ScreenLayout>
      <HeaderBar
        backLabel={t('common.back')}
        fallbackHref={`/pets/${id}`}
        title={t('labs.newTitle')}
      />
      <View className="gap-4">
        <DateField
          label={t('labs.date')}
          value={takenOn}
          onChange={(value) => setTakenOn(value ?? toIsoDate(new Date()))}
          formatValue={labels.date}
          placeholder={labels.date(takenOn)}
          maximumDate={new Date()}
          error={error('takenOn')}
        />
        <TextField
          label={t('labs.name')}
          value={title}
          onChangeText={setTitle}
          error={error('title')}
        />
        <TextField
          label={t('labs.clinic')}
          value={clinic}
          onChangeText={setClinic}
          error={error('clinic')}
        />
      </View>

      <View className="gap-3">
        <Text variant="heading">{t('labs.values')}</Text>
        <View className="gap-1.5">
          <Text variant="caption" tone="muted" className="font-sans-medium">
            {t('labs.presets')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {LAB_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant="secondary"
                size="sm"
                label={preset.name}
                onPress={() => setRows((current) => [...current, newRow(preset.name, preset.unit)])}
              />
            ))}
          </View>
        </View>

        {rows.map((row, index) => {
          const n = index + 1
          const path = (field: string) => `values.${index}.${field}`
          return (
            <View key={row.key} className="gap-3 rounded-xl border border-border bg-surface p-4">
              <View className="flex-row gap-3">
                <View className="flex-[2]">
                  <TextField
                    label={t('labs.valueName')}
                    accessibilityLabel={`${t('labs.valueName')} ${n}`}
                    value={row.name}
                    onChangeText={(name) => updateRow(row.key, { name })}
                    error={error(path('name'))}
                  />
                </View>
                <View className="flex-1">
                  <TextField
                    label={t('labs.unit')}
                    accessibilityLabel={`${t('labs.unit')} ${n}`}
                    value={row.unit}
                    onChangeText={(unit) => updateRow(row.key, { unit })}
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <TextField
                label={t('labs.value')}
                accessibilityLabel={`${t('labs.value')} ${n}`}
                value={row.value}
                onChangeText={(value) => updateRow(row.key, { value })}
                keyboardType="decimal-pad"
                error={error(path('value'))}
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextField
                    label={t('labs.refLow')}
                    accessibilityLabel={`${t('labs.refLow')} ${n}`}
                    value={row.refLow}
                    onChangeText={(refLow) => updateRow(row.key, { refLow })}
                    keyboardType="decimal-pad"
                    error={error(path('refLow'))}
                  />
                </View>
                <View className="flex-1">
                  <TextField
                    label={t('labs.refHigh')}
                    accessibilityLabel={`${t('labs.refHigh')} ${n}`}
                    value={row.refHigh}
                    onChangeText={(refHigh) => updateRow(row.key, { refHigh })}
                    keyboardType="decimal-pad"
                    error={error(path('refHigh'))}
                  />
                </View>
              </View>
              <Button
                variant="ghost"
                size="sm"
                label={t('labs.removeValue')}
                accessibilityLabel={`${t('labs.removeValue')} ${n}`}
                onPress={() => setRows((current) => current.filter((r) => r.key !== row.key))}
                className="self-end"
              />
            </View>
          )
        })}
        <Button
          variant="secondary"
          label={t('labs.addValue')}
          onPress={() => setRows((current) => [...current, newRow()])}
        />
        {error('values') ? (
          <Text accessibilityRole="alert" variant="caption" tone="danger">
            {error('values')}
          </Text>
        ) : null}
      </View>

      <PhotoStrip label={t('labs.photos')} onChange={setPhotoKeys} />
      <TextField
        label={t('labs.note')}
        value={note}
        onChangeText={setNote}
        multiline
        error={error('note')}
      />
      <Button label={t('labs.save')} onPress={save} loading={loading} />
    </ScreenLayout>
  )
}
