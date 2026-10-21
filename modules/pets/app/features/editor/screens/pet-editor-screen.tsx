import { useMutation, useQuery } from '@apollo/client/react'
import { Button, DateField, ScreenLayout, SegmentedControl, Text, TextField } from '@brain/ui'
import { router, useLocalSearchParams } from 'expo-router'
import { Archive } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import {
  PET_SEXES,
  PET_SPECIES,
  type PetSex,
  type PetSpecies,
  petInputSchema,
} from '../../../../shared/validation'
import { HeaderBar } from '../../../components/header-bar'
import {
  ArchivePetMutation,
  CreatePetMutation,
  PetListQuery,
  PetProfileQuery,
  UpdatePetMutation,
} from '../../../graphql/pets'
import { confirmAction } from '../../../lib/confirm'
import { issuesToFieldErrors, zodToFieldErrors } from '../../../lib/field-errors'
import { speciesEmoji } from '../../../lib/format'
import { goBack } from '../../../lib/navigation'
import { usePetLabels } from '../../../lib/use-pet-labels'
import { PhotoPicker } from '../components/photo-picker'

type Form = {
  name: string
  species: PetSpecies
  speciesOther: string
  breed: string
  sex: PetSex
  birthDate: string | null
  notes: string
  /** Only set when a new photo was uploaded in this session. */
  photoKey?: string
}

const EMPTY_FORM: Form = {
  name: '',
  species: 'DOG',
  speciesOther: '',
  breed: '',
  sex: 'UNKNOWN',
  birthDate: null,
  notes: '',
}

const isSpecies = (value: unknown): value is PetSpecies => PET_SPECIES.includes(value as PetSpecies)

/** Add (`/pets/new?species=CAT`) and edit (`/pets/[id]/edit`) share one form. */
export const PetEditorScreen = () => {
  const params = useLocalSearchParams<{ id?: string; species?: string }>()
  const petId = params.id
  const isEditing = Boolean(petId)
  const labels = usePetLabels()
  const { t } = labels

  const [form, setForm] = useState<Form>(() => ({
    ...EMPTY_FORM,
    species: isSpecies(params.species) ? params.species : 'DOG',
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { data } = useQuery(PetProfileQuery, { variables: { id: petId ?? '' }, skip: !isEditing })
  const existing = data?.pet

  useEffect(() => {
    if (!existing) return
    setForm({
      name: existing.name,
      species: existing.species,
      speciesOther: existing.speciesOther ?? '',
      breed: existing.breed ?? '',
      sex: existing.sex,
      birthDate: existing.birthDate ?? null,
      notes: existing.notes ?? '',
    })
  }, [existing])

  const [createPet, create] = useMutation(CreatePetMutation, {
    refetchQueries: [{ query: PetListQuery }],
  })
  const [updatePet, update] = useMutation(UpdatePetMutation)
  const [archivePet] = useMutation(ArchivePetMutation, {
    refetchQueries: [{ query: PetListQuery }],
  })

  const set =
    <K extends keyof Form>(key: K) =>
    (value: Form[K]) =>
      setForm((current) => ({ ...current, [key]: value }))
  const error = (field: string) => (errors[field] ? t(`validation.${errors[field]}`) : undefined)

  const save = async () => {
    const parsed = petInputSchema.safeParse(form)
    setErrors(zodToFieldErrors(parsed.error))
    if (!parsed.success) return
    const { photoKey, ...fields } = parsed.data
    const input = {
      ...fields,
      speciesOther: fields.species === 'OTHER' ? (fields.speciesOther ?? null) : null,
      breed: fields.breed ?? null,
      birthDate: fields.birthDate ?? null,
      notes: fields.notes ?? null,
    }

    if (petId) {
      const { data: result } = await updatePet({
        variables: { input: { id: petId, ...input, ...(photoKey ? { photoKey } : {}) } },
      })
      const payload = result?.updatePet
      if (payload?.__typename === 'ValidationError')
        return setErrors(issuesToFieldErrors(payload.issues))
      if (payload?.__typename === 'MutationUpdatePetSuccess') goBack(`/pets/${petId}`)
      return
    }

    const { data: result } = await createPet({
      variables: { input: { ...input, photoKey: photoKey ?? null } },
    })
    const payload = result?.createPet
    if (payload?.__typename === 'ValidationError')
      return setErrors(issuesToFieldErrors(payload.issues))
    if (payload?.__typename === 'MutationCreatePetSuccess')
      router.replace(`/pets/${payload.data.id}`)
  }

  const archive = async () => {
    if (!petId) return
    const isConfirmed = await confirmAction(t('editor.archiveConfirm', { name: form.name }), {
      confirm: t('editor.archive'),
      cancel: t('common.cancel'),
    })
    if (!isConfirmed) return
    await archivePet({ variables: { input: { id: petId } } })
    router.replace('/pets')
  }

  return (
    <ScreenLayout>
      <HeaderBar
        backLabel={t('common.back')}
        fallbackHref={petId ? `/pets/${petId}` : '/pets'}
        title={
          isEditing ? t('editor.editTitle', { name: existing?.name ?? '' }) : t('editor.newTitle')
        }
      />

      <PhotoPicker
        name={form.name}
        fallback={speciesEmoji(form.species)}
        imageUrl={existing?.photoUrl}
        onUploaded={set('photoKey')}
      />

      <View className="gap-4">
        <TextField
          label={t('editor.name')}
          value={form.name}
          onChangeText={set('name')}
          error={error('name')}
        />
        <View className="gap-1.5">
          <Text variant="caption" tone="muted" className="font-sans-medium">
            {t('editor.species')}
          </Text>
          <SegmentedControl
            label={t('editor.species')}
            options={PET_SPECIES.map((value) => ({ value, label: t(`species.${value}`) }))}
            value={form.species}
            onChange={set('species')}
          />
        </View>
        {form.species === 'OTHER' ? (
          <TextField
            label={t('editor.speciesOther')}
            value={form.speciesOther}
            onChangeText={set('speciesOther')}
            error={error('speciesOther')}
          />
        ) : null}
        <TextField
          label={t('editor.breed')}
          value={form.breed}
          onChangeText={set('breed')}
          error={error('breed')}
        />
        <View className="gap-1.5">
          <Text variant="caption" tone="muted" className="font-sans-medium">
            {t('editor.sex')}
          </Text>
          <SegmentedControl
            label={t('editor.sex')}
            options={PET_SEXES.map((value) => ({ value, label: t(`sex.${value}`) }))}
            value={form.sex}
            onChange={set('sex')}
          />
        </View>
        <DateField
          label={t('editor.birthday')}
          value={form.birthDate}
          onChange={set('birthDate')}
          formatValue={labels.date}
          placeholder={t('editor.birthdayPlaceholder')}
          clearLabel={t('editor.clear')}
          maximumDate={new Date()}
          error={error('birthDate')}
        />
        <TextField
          label={t('editor.notes')}
          value={form.notes}
          onChangeText={set('notes')}
          multiline
          error={error('notes')}
        />
        <Button
          label={isEditing ? t('common.save') : t('editor.create')}
          onPress={save}
          loading={create.loading || update.loading}
        />
      </View>

      {isEditing ? (
        <Button
          variant="ghost"
          icon={Archive}
          label={t('editor.archive')}
          onPress={archive}
          className="self-center"
        />
      ) : null}
    </ScreenLayout>
  )
}
