import { Icon, ListItem, Sheet, TextField } from '@brain/ui'
import { Plus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import {
  findLabTest,
  type LabTest,
  labCodeFor,
  searchLabTests,
} from '../../../../shared/lab-catalog'
import { usePetLabels } from '../../../lib/use-pet-labels'

const MAX_RESULTS = 12

export type PickedTest = { test: LabTest } | { customName: string }

/** Find a test by code, English or the Thai name vets use; anything else can be added as custom. */
export const TestPickerSheet = ({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean
  onClose: () => void
  onPick: (picked: PickedTest) => void
}) => {
  const { t } = usePetLabels()
  const [query, setQuery] = useState('')
  const matches = searchLabTests(query).slice(0, MAX_RESULTS)
  const trimmed = query.trim()
  /** Offer a custom test only when the text isn't already a catalog name. */
  const canAddCustom = trimmed !== '' && !findLabTest(labCodeFor(trimmed))

  useEffect(() => {
    if (visible) setQuery('')
  }, [visible])

  const pick = (picked: PickedTest) => {
    onPick(picked)
    onClose()
  }

  return (
    <Sheet
      visible={visible}
      title={t('labs.addTest')}
      closeLabel={t('common.close')}
      onClose={onClose}
    >
      <TextField
        label={t('labs.searchTest')}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View>
        {matches.map((test) => (
          <ListItem
            key={test.code}
            title={test.kind === 'NUMERIC' ? `${test.code} · ${test.en}` : test.en}
            subtitle={test.th.join(', ') || null}
            accessibilityLabel={test.kind === 'NUMERIC' ? `${test.code} ${test.en}` : test.en}
            onPress={() => pick({ test })}
          />
        ))}
        {canAddCustom ? (
          <ListItem
            leading={<Icon icon={Plus} tone="primary" />}
            title={t('labs.addCustom', { name: trimmed })}
            onPress={() => pick({ customName: trimmed })}
          />
        ) : null}
      </View>
    </Sheet>
  )
}
