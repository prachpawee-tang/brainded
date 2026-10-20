import { Pressable, View } from 'react-native'
import { cn } from '../../lib/cn'

export type SwitchProps = {
  /** Already-translated accessible name. */
  label: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

export const Switch = ({ label, value, onValueChange, disabled = false }: SwitchProps) => (
  <Pressable
    accessibilityRole="switch"
    accessibilityLabel={label}
    accessibilityState={{ checked: value, disabled }}
    disabled={disabled}
    onPress={() => onValueChange(!value)}
    hitSlop={8}
    className={cn(
      'h-7 w-12 justify-center rounded-full px-0.5 active:opacity-80 disabled:opacity-50',
      value ? 'bg-primary' : 'bg-border',
    )}
  >
    <View
      className={cn(
        'size-6 rounded-full bg-surface shadow-sm transition-transform',
        value ? 'translate-x-5' : 'translate-x-0',
      )}
    />
  </Pressable>
)
