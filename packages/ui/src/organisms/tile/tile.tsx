import { ChevronRight } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Icon } from '../../atoms/icon/icon'
import { Text } from '../../atoms/text/text'
import { cn } from '../../lib/cn'

export type TileProps = {
  title: string
  description?: string
  /** Emoji or short glyph. */
  icon: string
  /** Hex color (e.g. a module accent) for the icon bubble. */
  accentColor: string
  onPress: () => void
  className?: string
}

export const Tile = ({ title, description, icon, accentColor, onPress, className }: TileProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={title}
    onPress={onPress}
    className={cn(
      'flex-row items-center gap-4 rounded-xl border border-border bg-surface p-4',
      'active:scale-[0.98] active:opacity-90',
      className,
    )}
  >
    <View
      className="size-12 items-center justify-center rounded-lg"
      style={{ backgroundColor: accentColor }}
    >
      <Text className="text-xl">{icon}</Text>
    </View>
    <View className="flex-1 gap-0.5">
      <Text variant="heading">{title}</Text>
      {description ? (
        <Text variant="caption" tone="muted" numberOfLines={2}>
          {description}
        </Text>
      ) : null}
    </View>
    <Icon icon={ChevronRight} tone="muted" />
  </Pressable>
)
