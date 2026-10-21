import { useMutation } from '@apollo/client/react'
import { Button, DateField, SegmentedControl, Sheet, TextField, toIsoDate } from '@brain/ui'
import { useState } from 'react'
import { PET_NOTE_TYPES, type PetNoteType, petNoteInputSchema } from '../../../../shared/validation'
import { AddPetNoteMutation, PetTimelineQuery } from '../../../graphql/pets'
import { issuesToFieldErrors, zodToFieldErrors } from '../../../lib/field-errors'
import { usePetLabels } from '../../../lib/use-pet-labels'

type Props = { petId: string; visible: boolean; onClose: () => void; onSaved: () => void }

export const NoteSheet = ({ petId, visible, onClose, onSaved }: Props) => {
  const { t, date } = usePetLabels()
  const [type, setType] = useState<PetNoteType>('GENERAL')
  const [body, setBody] = useState('')
  const [occurredOn, setOccurredOn] = useState(() => toIsoDate(new Date()))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [addNote, { loading }] = useMutation(AddPetNoteMutation, {
    refetchQueries: [{ query: PetTimelineQuery, variables: { id: petId } }],
  })

  const save = async () => {
    const parsed = petNoteInputSchema.safeParse({ type, body, occurredOn })
    setErrors(zodToFieldErrors(parsed.error))
    if (!parsed.success) return
    const { data } = await addNote({ variables: { input: { petId, ...parsed.data } } })
    const result = data?.addPetNote
    if (result?.__typename === 'ValidationError')
      return setErrors(issuesToFieldErrors(result.issues))
    setBody('')
    // Next log starts fresh: today's date, not the date picked for this one.
    setOccurredOn(toIsoDate(new Date()))
    onSaved()
  }

  const error = (field: string) => (errors[field] ? t(`validation.${errors[field]}`) : undefined)

  return (
    <Sheet
      visible={visible}
      title={t('noteSheet.title')}
      closeLabel={t('common.close')}
      onClose={onClose}
    >
      <SegmentedControl
        label={t('noteSheet.type')}
        options={PET_NOTE_TYPES.map((value) => ({ value, label: t(`noteType.${value}`) }))}
        value={type}
        onChange={setType}
      />
      <TextField
        label={t('noteSheet.body')}
        value={body}
        onChangeText={setBody}
        multiline
        error={error('body')}
      />
      <DateField
        label={t('noteSheet.date')}
        value={occurredOn}
        onChange={(value) => setOccurredOn(value ?? toIsoDate(new Date()))}
        formatValue={date}
        placeholder={date(occurredOn)}
        maximumDate={new Date()}
        error={error('occurredOn')}
      />
      <Button label={t('common.save')} onPress={save} loading={loading} />
    </Sheet>
  )
}
