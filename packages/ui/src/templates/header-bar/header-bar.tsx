import type { LucideIcon } from 'lucide-react-native'
import { ChevronLeft } from 'lucide-react-native'
import { View } from 'react-native'
import { IconButton } from '../../atoms/icon-button/icon-button'
import { Text } from '../../atoms/text/text'
import { cn } from '../../lib/cn'

export type HeaderAction = { label: string; icon: LucideIcon; onPress: () => void }

export type HeaderBarProps = {
  /** Accessible name of the icon-only back button. */
  backLabel: string
  /** Router-agnostic: the app decides what "back" means (e.g. history, or a parent screen). */
  onBack: () => void
  title?: string
  actions?: HeaderAction[]
  className?: string
}

/** Icon-only back + optional centered title + optional icon actions (labels are their names). */
export const HeaderBar = ({
  backLabel,
  onBack,
  title,
  actions = [],
  className,
}: HeaderBarProps) => (
  <View className={cn('-mx-3 flex-row items-center gap-1', className)}>
    <IconButton icon={ChevronLeft} label={backLabel} onPress={onBack} />
    <View className="flex-1">
      {title ? (
        <Text variant="heading" numberOfLines={1} className="text-center">
          {title}
        </Text>
      ) : null}
    </View>
    <View className="min-w-11 flex-row justify-end">
      {actions.map((action) => (
        <IconButton
          key={action.label}
          icon={action.icon}
          label={action.label}
          onPress={action.onPress}
        />
      ))}
    </View>
  </View>
)
