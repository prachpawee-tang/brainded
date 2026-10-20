import { Button, Text } from '@brain/ui'
import type { ReactNode } from 'react'
import { View } from 'react-native'

type Action = { label: string; onPress: () => void }

/** Profile section: heading + optional actions + a card body. */
export const Section = ({
  title,
  actions = [],
  children,
}: {
  title: string
  actions?: Action[]
  children: ReactNode
}) => (
  <View className="gap-3">
    <View className="flex-row items-center justify-between gap-2">
      <Text variant="heading">{title}</Text>
      <View className="flex-row">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            size="sm"
            label={action.label}
            onPress={action.onPress}
            className="-mr-2"
          />
        ))}
      </View>
    </View>
    <View className="rounded-xl border border-border bg-surface px-4 py-2">{children}</View>
  </View>
)
