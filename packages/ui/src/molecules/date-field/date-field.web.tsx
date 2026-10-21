import { X } from 'lucide-react-native'
import { createElement, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { IconButton } from '../../atoms/icon-button/icon-button'
import { Text } from '../../atoms/text/text'
import type { DateFieldProps } from './date-field.types'
import { toIsoDate } from './date-value'

export type { DateFieldProps } from './date-field.types'

type DateInput = { value: string; validity: { badInput: boolean } }

/**
 * Web: the browser's native date input. It is deliberately UNcontrolled: while the user is
 * typing a partial date the input reports `''`, and a controlled `value` would wipe what they
 * typed. We sync outside changes through the ref and only report complete dates or a real clear.
 */
export const DateField = ({
  label,
  value,
  onChange,
  clearLabel,
  maximumDate,
  error,
}: DateFieldProps) => {
  const inputRef = useRef<DateInput | null>(null)

  useEffect(() => {
    const input = inputRef.current
    if (input && input.value !== (value ?? '')) input.value = value ?? ''
  }, [value])

  const handleChange = (event: { target: DateInput }) => {
    const { value: next, validity } = event.target
    if (next) onChange(next)
    else if (!validity.badInput) onChange(null)
  }

  return (
    <View className="gap-1.5">
      <Text variant="caption" tone="muted" className="font-sans-medium">
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {createElement('input', {
          ref: inputRef,
          type: 'date',
          'aria-label': label,
          defaultValue: value ?? '',
          max: maximumDate ? toIsoDate(maximumDate) : undefined,
          onChange: handleChange,
          style: {
            flex: 1,
            height: 48,
            padding: '0 16px',
            borderRadius: 12,
            border: `1px solid var(${error ? '--color-danger' : '--color-border'})`,
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            colorScheme: 'light dark',
          },
        })}
        {clearLabel && value ? (
          <IconButton icon={X} label={clearLabel} onPress={() => onChange(null)} />
        ) : null}
      </View>
      {error ? (
        <Text accessibilityRole="alert" variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  )
}
