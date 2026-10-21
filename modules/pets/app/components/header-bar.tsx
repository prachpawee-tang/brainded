import { Button, Text } from '@brain/ui'
import type { Href } from 'expo-router'
import { View } from 'react-native'
import { goBack } from '../lib/navigation'

/** Back (to `fallbackHref` when there is no history) + optional title + optional trailing action. */
export const HeaderBar = ({
  backLabel,
  fallbackHref,
  title,
  action,
}: {
  backLabel: string
  /** Parent screen, used after a reload or deep link. */
  fallbackHref: Href
  title?: string
  action?: { label: string; onPress: () => void }
}) => (
  <View className="flex-row items-center justify-between gap-2">
    <Button
      variant="ghost"
      size="sm"
      label={backLabel}
      onPress={() => goBack(fallbackHref)}
      className="-ml-3"
    />
    {title ? (
      <Text variant="heading" numberOfLines={1} className="flex-1 text-center">
        {title}
      </Text>
    ) : (
      <View className="flex-1" />
    )}
    {action ? (
      <Button
        variant="ghost"
        size="sm"
        label={action.label}
        onPress={action.onPress}
        className="-mr-3"
      />
    ) : (
      <View className="w-16" />
    )}
  </View>
)
