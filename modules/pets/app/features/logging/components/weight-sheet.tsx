import { useMutation } from '@apollo/client/react'
import { Button, DateField, Sheet, TextField, toIsoDate } from '@brain/ui'
import { useState } from 'react'
import { petWeightInputSchema } from '../../../../shared/validation'
import { LogPetWeightMutation, PetTimelineQuery } from '../../../graphql/pets'
import { issuesToFieldErrors, zodToFieldErrors } from '../../../lib/field-errors'
import { usePetLabels } from '../../../lib/use-pet-labels'

type Props = { petId: string; visible: boolean; onClose: () => void; onSaved: () => void }

/** Accepts "4,5" as well as "4.5" (Thai keyboards often show a comma). */
const parseKg = (value: string) =>
  value.trim() === '' ? Number.NaN : Number(value.replace(',', '.'))

export const WeightSheet = ({ petId, visible, onClose, onSaved }: Props) => {
  const { t, date } = usePetLabels()
  const [weight, setWeight] = useState('')
  const [measuredOn, setMeasuredOn] = useState(() => toIsoDate(new Date()))
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [logWeight, { loading }] = useMutation(LogPetWeightMutation, {
    refetchQueries: [{ query: PetTimelineQuery, variables: { id: petId } }],
  })

  const save = async () => {
    const parsed = petWeightInputSchema.safeParse({ weightKg: parseKg(weight), measuredOn, note })
    setErrors(zodToFieldErrors(parsed.error))
    if (!parsed.success) return
    const { data } = await logWeight({
      variables: { input: { petId, ...parsed.data, note: parsed.data.note ?? null } },
    })
    const result = data?.logPetWeight
    if (result?.__typename === 'ValidationError')
      return setErrors(issuesToFieldErrors(result.issues))
    setWeight('')
    setNote('')
    onSaved()
  }

  const error = (field: string) => (errors[field] ? t(`validation.${errors[field]}`) : undefined)

  return (
    <Sheet
      visible={visible}
      title={t('weightSheet.title')}
      closeLabel={t('common.close')}
      onClose={onClose}
    >
      <TextField
        label={t('weightSheet.weight')}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        autoFocus
        error={error('weightKg')}
      />
      <DateField
        label={t('weightSheet.date')}
        value={measuredOn}
        onChange={(value) => setMeasuredOn(value ?? toIsoDate(new Date()))}
        formatValue={date}
        placeholder={date(measuredOn)}
        maximumDate={new Date()}
        error={error('measuredOn')}
      />
      <TextField
        label={t('weightSheet.note')}
        value={note}
        onChangeText={setNote}
        error={error('note')}
      />
      <Button label={t('common.save')} onPress={save} loading={loading} />
    </Sheet>
  )
}
