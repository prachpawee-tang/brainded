import { IconButton, TextField } from '@brain/ui'
import { Trash2 } from 'lucide-react-native'
import { View } from 'react-native'
import { usePetLabels } from '../../../lib/use-pet-labels'
import type { LabRow } from '../lib/lab-form'

type Props = {
  row: LabRow
  /** 1-based, for accessible names ("Result 2"). */
  n: number
  error: (field: string) => string | undefined
  onChange: (patch: Partial<LabRow>) => void
  onRemove: () => void
}

/** One test on the report: name + unit, a result (number or text answer), and the printed range. */
export const LabValueRow = ({ row, n, error, onChange, onRemove }: Props) => {
  const { t } = usePetLabels()
  return (
    <View className="gap-3 rounded-xl border border-border bg-surface p-4">
      <View className="flex-row gap-3">
        <View className="flex-[2]">
          <TextField
            label={t('labs.valueName')}
            accessibilityLabel={`${t('labs.valueName')} ${n}`}
            value={row.name}
            onChangeText={(name) => onChange({ name })}
            error={error('name')}
          />
        </View>
        <View className="flex-1">
          <TextField
            label={t('labs.unit')}
            accessibilityLabel={`${t('labs.unit')} ${n}`}
            value={row.unit}
            onChangeText={(unit) => onChange({ unit })}
            autoCapitalize="none"
          />
        </View>
      </View>
      <TextField
        label={t('labs.value')}
        accessibilityLabel={`${t('labs.value')} ${n}`}
        value={row.value}
        onChangeText={(value) => onChange({ value })}
        placeholder={t('labs.valueHint')}
        autoCapitalize="none"
        error={error('value')}
      />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField
            label={t('labs.refLow')}
            accessibilityLabel={`${t('labs.refLow')} ${n}`}
            value={row.refLow}
            onChangeText={(refLow) => onChange({ refLow })}
            keyboardType="decimal-pad"
            error={error('refLow')}
          />
        </View>
        <View className="flex-1">
          <TextField
            label={t('labs.refHigh')}
            accessibilityLabel={`${t('labs.refHigh')} ${n}`}
            value={row.refHigh}
            onChangeText={(refHigh) => onChange({ refHigh })}
            keyboardType="decimal-pad"
            error={error('refHigh')}
          />
        </View>
      </View>
      <IconButton
        icon={Trash2}
        label={`${t('labs.removeValue')} ${n}`}
        onPress={onRemove}
        className="-mb-2 -mr-2 self-end"
      />
    </View>
  )
}
