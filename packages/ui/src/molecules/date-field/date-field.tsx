import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { X } from 'lucide-react-native'
import { useState } from 'react'
import { Platform, Pressable, View } from 'react-native'
import { IconButton } from '../../atoms/icon-button/icon-button'
import { Text } from '../../atoms/text/text'
import { cn } from '../../lib/cn'
import type { DateFieldProps } from './date-field.types'
import { fromIsoDate, toIsoDate } from './date-value'

export type { DateFieldProps } from './date-field.types'

/** Native date field. Web uses `date-field.web.tsx` (an `<input type="date">`). */
export const DateField = ({
  label,
  value,
  onChange,
  formatValue,
  placeholder,
  clearLabel,
  maximumDate,
  error,
}: DateFieldProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setIsOpen(false)
    if (event.type === 'set' && date) onChange(toIsoDate(date))
  }

  return (
    <View className="gap-1.5">
      <Text variant="caption" tone="muted" className="font-sans-medium">
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={() => setIsOpen((open) => !open)}
          className={cn(
            'h-12 flex-1 justify-center rounded-md border bg-surface px-4 active:opacity-80',
            error ? 'border-danger' : 'border-border',
          )}
        >
          <Text tone={value ? 'default' : 'muted'}>{value ? formatValue(value) : placeholder}</Text>
        </Pressable>
        {clearLabel && value ? (
          <IconButton icon={X} label={clearLabel} onPress={() => onChange(null)} />
        ) : null}
      </View>
      {isOpen ? (
        <DateTimePicker
          value={value ? fromIsoDate(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  )
}
