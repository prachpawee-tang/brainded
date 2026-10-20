import { Text } from '@brain/ui'
import type { ReactNode } from 'react'
import { View } from 'react-native'

export const SettingsSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <View className="gap-3">
    <Text variant="caption" tone="muted" className="font-sans-medium uppercase tracking-wider">
      {title}
    </Text>
    <View className="gap-3 rounded-xl border border-border bg-surface p-4">{children}</View>
  </View>
)
