import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { Button, DateField, ScreenLayout, Skeleton, Text, TextField, toIsoDate } from '@brain/ui'
import { router, useLocalSearchParams } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { LAB_PRESETS, labResultInputSchema } from '../../../../shared/health'
import { findLabTest, type LabTest } from '../../../../shared/lab-catalog'
import { toValidationIssues } from '../../../../shared/validation'
import { HeaderBar } from '../../../components/header-bar'
import { PhotoStrip } from '../../../components/photo-strip'
import {
  AddPetLabResultMutation,
  PetLabResultQuery,
  PetLabTrendQuery,
  UpdatePetLabResultMutation,
} from '../../../graphql/health'
import { issuesToPathErrors } from '../../../lib/field-errors'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { LabValueRow } from '../components/lab-value-row'
import { type PickedTest, TestPickerSheet } from '../components/test-picker-sheet'
import {
  groupBySection,
  type LabRow,
  newLabRow,
  rowFromTest,
  rowFromValue,
  toLabValues,
} from '../lib/lab-form'

const REFETCH = ['PetLabResults', 'PetLabResult', 'PetLabTrend', 'PetTimeline']

type Form = {
  takenOn: string
  title: string
  clinic: string
  note: string
  remark: string
  interpretation: string
}

const EMPTY_FORM: Form = {
  takenOn: '',
  title: '',
  clinic: '',
  note: '',
  remark: '',
  interpretation: '',
}

/** New result, or edit (`labId` param): the editor always sends the whole result. */
export const LabResultEditorScreen = () => {
  const { id, labId } = useLocalSearchParams<{ id: string; labId?: string }>()
  const isEdit = Boolean(labId)
  const labels = usePetLabels()
  const { t } = labels
  const client = useApolloClient()
  const existing = useQuery(PetLabResultQuery, {
    variables: { id, labId: labId ?? '' },
    skip: !isEdit,
  })
  const [form, setForm] = useState<Form>(() => ({ ...EMPTY_FORM, takenOn: toIsoDate(new Date()) }))
  const [rows, setRows] = useState<LabRow[]>([])
  const [photoKeys, setPhotoKeys] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const loadedId = useRef<string | null>(null)
  const [addResult, add] = useMutation(AddPetLabResultMutation, { refetchQueries: REFETCH })
  const [updateResult, update] = useMutation(UpdatePetLabResultMutation, {
    refetchQueries: REFETCH,
  })
  const result = existing.data?.pet?.labResult

  useEffect(() => {
    if (!result || loadedId.current === result.id) return
    loadedId.current = result.id
    setForm({
      takenOn: result.takenOn,
      title: result.title,
      clinic: result.clinic ?? '',
      note: result.note ?? '',
      remark: result.remark ?? '',
      interpretation: result.interpretation ?? '',
    })
    setRows(result.values.map(rowFromValue))
    setPhotoKeys(result.photos.map((p) => p.key))
  }, [result])

  const set = (key: keyof Form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))
  const error = (path: string) => (errors[path] ? t(`validation.${errors[path]}`) : undefined)
  const updateRow = (key: number, patch: Partial<LabRow>) =>
    setRows((current) => current.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  /** Prefill unit + range from this pet's latest value of the test; the catalog never guesses ranges. */
  const addTest = async (test: LabTest) => {
    const previous = await client
      .query({ query: PetLabTrendQuery, variables: { id, code: test.code } })
      .then(({ data }) => data?.pet?.labTrend.at(-1) ?? null)
      .catch(() => null)
    setRows((current) => [...current, rowFromTest(test, previous)])
  }

  const onPick = (picked: PickedTest) =>
    'test' in picked
      ? addTest(picked.test)
      : setRows((current) => [...current, newLabRow({ name: picked.customName })])

  const save = async () => {
    const parsed = labResultInputSchema.safeParse({ ...form, photoKeys, values: toLabValues(rows) })
    setErrors(issuesToPathErrors(toValidationIssues(parsed.error)))
    if (!parsed.success) return
    const fields = {
      ...parsed.data,
      clinic: parsed.data.clinic ?? null,
      note: parsed.data.note ?? null,
      remark: parsed.data.remark ?? null,
      interpretation: parsed.data.interpretation ?? null,
      values: parsed.data.values.map((v) => ({
        ...v,
        code: v.code ?? null,
        value: v.value ?? null,
        textValue: v.textValue ?? null,
        unit: v.unit ?? null,
        refLow: v.refLow ?? null,
        refHigh: v.refHigh ?? null,
      })),
    }
    const { data } = labId
      ? await updateResult({ variables: { input: { id: labId, ...fields } } })
      : await addResult({ variables: { input: { petId: id, ...fields } } })
    const payload =
      data && ('updatePetLabResult' in data ? data.updatePetLabResult : data.addPetLabResult)
    if (payload?.__typename === 'ValidationError')
      return setErrors(issuesToPathErrors(payload.issues))
    if (payload && 'data' in payload) router.replace(`/pets/${id}/labs/${payload.data.id}`)
  }

  if (isEdit && !result) {
    return (
      <ScreenLayout>
        <Skeleton className="h-64 rounded-xl" />
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout>
      <HeaderBar
        backLabel={t('common.back')}
        fallbackHref={labId ? `/pets/${id}/labs/${labId}` : `/pets/${id}/labs`}
        title={isEdit ? t('labs.editTitle') : t('labs.newTitle')}
      />
      <View className="gap-4">
        <DateField
          label={t('labs.date')}
          value={form.takenOn}
          onChange={(value) => set('takenOn')(value ?? toIsoDate(new Date()))}
          formatValue={labels.date}
          placeholder={labels.date(form.takenOn)}
          maximumDate={new Date()}
          error={error('takenOn')}
        />
        <TextField
          label={t('labs.name')}
          value={form.title}
          onChangeText={set('title')}
          error={error('title')}
        />
        <TextField
          label={t('labs.clinic')}
          value={form.clinic}
          onChangeText={set('clinic')}
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
                onPress={() => {
                  const test = findLabTest(preset.name)
                  if (test) addTest(test)
                }}
              />
            ))}
          </View>
        </View>

        {groupBySection(rows).map((group) => (
          <View key={group.section} className="gap-2">
            <Text variant="caption" tone="muted" className="font-sans-medium">
              {t(`labs.sections.${group.section}`)}
            </Text>
            {group.items.map(({ item: row, index }) => (
              <LabValueRow
                key={row.key}
                row={row}
                n={index + 1}
                error={(field) => error(`values.${index}.${field}`)}
                onChange={(patch) => updateRow(row.key, patch)}
                onRemove={() => setRows((current) => current.filter((r) => r.key !== row.key))}
              />
            ))}
          </View>
        ))}
        <Button
          variant="secondary"
          icon={Plus}
          label={t('labs.addTest')}
          onPress={() => setIsPickerOpen(true)}
        />
        {error('values') ? (
          <Text accessibilityRole="alert" variant="caption" tone="danger">
            {error('values')}
          </Text>
        ) : null}
      </View>

      <PhotoStrip
        label={t('labs.photos')}
        initial={result?.photos.map((p) => ({ key: p.key, uri: p.url }))}
        onChange={setPhotoKeys}
      />
      <TextField
        label={t('labs.remark')}
        value={form.remark}
        onChangeText={set('remark')}
        multiline
        error={error('remark')}
      />
      <TextField
        label={t('labs.interpretation')}
        value={form.interpretation}
        onChangeText={set('interpretation')}
        multiline
        error={error('interpretation')}
      />
      <TextField
        label={t('labs.note')}
        value={form.note}
        onChangeText={set('note')}
        multiline
        error={error('note')}
      />
      <Button label={t('labs.save')} onPress={save} loading={add.loading || update.loading} />
      <TestPickerSheet
        visible={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onPick={onPick}
      />
    </ScreenLayout>
  )
}
