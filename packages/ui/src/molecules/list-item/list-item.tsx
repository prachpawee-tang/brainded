import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { Text } from '../../atoms/text/text'
import { cn } from '../../lib/cn'

export type ListItemProps = {
  title: string
  subtitle?: string | null
  /** Right-aligned content (badge, value, chevron). */
  trailing?: ReactNode
  /** Leading content (icon bubble, checkbox, avatar). */
  leading?: ReactNode
  onPress?: () => void
  /** Defaults to the title. */
  accessibilityLabel?: string
  className?: string
}

export const ListItem = ({
  title,
  subtitle,
  trailing,
  leading,
  onPress,
  accessibilityLabel,
  className,
}: ListItemProps) => {
  const content = (
    <>
      {leading}
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-medium" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </>
  )
  const classes = cn('min-h-12 flex-row items-center gap-3 py-2', className)
  if (!onPress) return <View className={classes}>{content}</View>
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      className={cn(classes, 'active:opacity-70')}
    >
      {content}
    </Pressable>
  )
}
