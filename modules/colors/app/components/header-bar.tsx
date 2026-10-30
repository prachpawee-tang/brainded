import { IconButton, Text } from '@brain/ui'
import type { Href } from 'expo-router'
import { ChevronLeft, type LucideIcon } from 'lucide-react-native'
import { View } from 'react-native'
import { goBack } from '../lib/navigation'

export type HeaderAction = { label: string; icon: LucideIcon; onPress: () => void }

/** Icon-only back (to `fallbackHref` when there is no history) + optional title + optional icon actions. */
export const HeaderBar = ({
  backLabel,
  fallbackHref,
  title,
  actions = [],
}: {
  backLabel: string
  /** Parent screen, used after a reload or deep link. */
  fallbackHref: Href
  title?: string
  actions?: HeaderAction[]
}) => (
  <View className="-mx-3 flex-row items-center gap-1">
    <IconButton icon={ChevronLeft} label={backLabel} onPress={() => goBack(fallbackHref)} />
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
