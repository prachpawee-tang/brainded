import { createElement } from 'react'
import { View } from 'react-native'
import { Button } from '../../atoms/button/button'
import { Text } from '../../atoms/text/text'
import type { DateFieldProps } from './date-field.types'
import { toIsoDate } from './date-value'

export type { DateFieldProps } from './date-field.types'

/** Web: the browser's native date input (accessible, keyboard-friendly, locale-aware). */
export const DateField = ({
  label,
  value,
  onChange,
  clearLabel,
  maximumDate,
  error,
}: DateFieldProps) => (
  <View className="gap-1.5">
    <Text variant="caption" tone="muted" className="font-sans-medium">
      {label}
    </Text>
    <View className="flex-row items-center gap-2">
      {createElement('input', {
        type: 'date',
        'aria-label': label,
        value: value ?? '',
        max: maximumDate ? toIsoDate(maximumDate) : undefined,
        onChange: (event: { target: { value: string } }) => onChange(event.target.value || null),
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
        <Button variant="ghost" size="sm" label={clearLabel} onPress={() => onChange(null)} />
      ) : null}
    </View>
    {error ? (
      <Text accessibilityRole="alert" variant="caption" tone="danger">
        {error}
      </Text>
    ) : null}
  </View>
)
