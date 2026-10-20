import { TextInput, type TextInputProps, View } from 'react-native'
import { Text } from '../../atoms/text/text'
import { cn } from '../../lib/cn'

export type TextFieldProps = Omit<TextInputProps, 'className'> & {
  /** Already-translated label; also the accessible name. */
  label: string
  /** Already-translated error message. */
  error?: string | undefined
  className?: string
}

export const TextField = ({ label, error, className, ...props }: TextFieldProps) => (
  <View className={cn('gap-1.5', className)}>
    <Text variant="caption" tone="muted" className="font-sans-medium">
      {label}
    </Text>
    <TextInput
      accessibilityLabel={label}
      placeholderTextColorClassName="accent-text-muted"
      className={cn(
        'h-12 rounded-md border bg-surface px-4 font-sans text-base text-text',
        'focus:border-primary',
        error ? 'border-danger' : 'border-border',
      )}
      {...props}
    />
    {error ? (
      <Text accessibilityRole="alert" variant="caption" tone="danger">
        {error}
      </Text>
    ) : null}
  </View>
)
