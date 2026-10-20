import { Pressable, View } from 'react-native'
import { Text } from '../../atoms/text/text'
import { cn } from '../../lib/cn'

export type SegmentedOption<T extends string> = { value: T; label: string }

export type SegmentedControlProps<T extends string> = {
  /** Already-translated accessible name of the group. */
  label: string
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}

export const SegmentedControl = <T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) => (
  <View
    accessibilityRole="radiogroup"
    accessibilityLabel={label}
    className="flex-row gap-1 rounded-lg bg-surface-muted p-1"
  >
    {options.map((option) => {
      const isSelected = option.value === value
      return (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityLabel={option.label}
          accessibilityState={{ checked: isSelected }}
          onPress={() => onChange(option.value)}
          className={cn(
            'h-9 flex-1 items-center justify-center rounded-md active:scale-95',
            isSelected && 'bg-surface shadow-sm',
          )}
        >
          <Text
            variant="caption"
            tone={isSelected ? 'default' : 'muted'}
            className="font-sans-medium"
          >
            {option.label}
          </Text>
        </Pressable>
      )
    })}
  </View>
)
