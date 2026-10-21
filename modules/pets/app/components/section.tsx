import { IconButton, Text } from '@brain/ui'
import type { LucideIcon } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { View } from 'react-native'

export type SectionAction = {
  label: string
  icon: LucideIcon
  onPress: () => void
  isPrimary?: boolean
}

/** Profile section: heading + icon actions (labels are their accessible names) + a card body. */
export const Section = ({
  title,
  actions = [],
  children,
}: {
  title: string
  actions?: SectionAction[]
  children: ReactNode
}) => (
  <View className="gap-2">
    <View className="-mr-2 flex-row items-center justify-between gap-2">
      <Text variant="heading">{title}</Text>
      <View className="flex-row gap-1">
        {actions.map((action) => (
          <IconButton
            key={action.label}
            icon={action.icon}
            label={action.label}
            variant={action.isPrimary ? 'soft' : 'ghost'}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
    <View className="rounded-xl border border-border bg-surface px-4 py-2">{children}</View>
  </View>
)
