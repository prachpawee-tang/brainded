import { Pressable, View } from 'react-native'
import { cn } from '../../lib/cn'
import { Text } from '../text/text'

export type CheckboxProps = {
  /** Already-translated accessible name. */
  label: string
  value: boolean
  onValueChange: (value: boolean) => void
  className?: string
}

export const Checkbox = ({ label, value, onValueChange, className }: CheckboxProps) => (
  <Pressable
    accessibilityRole="checkbox"
    accessibilityLabel={label}
    accessibilityState={{ checked: value }}
    onPress={() => onValueChange(!value)}
    hitSlop={8}
    className={cn(
      'size-7 items-center justify-center rounded-sm border-2 active:scale-90',
      value ? 'border-primary bg-primary' : 'border-border bg-surface',
      className,
    )}
  >
    {value ? <Text className="text-on-primary font-sans-bold leading-none">✓</Text> : <View />}
  </Pressable>
)
