import { Button, Text } from '@brain/ui'
import { router } from 'expo-router'
import { View } from 'react-native'

/** Back + optional title + optional trailing action. */
export const HeaderBar = ({
  backLabel,
  title,
  action,
}: {
  backLabel: string
  title?: string
  action?: { label: string; onPress: () => void }
}) => (
  <View className="flex-row items-center justify-between gap-2">
    <Button
      variant="ghost"
      size="sm"
      label={backLabel}
      onPress={() => router.back()}
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
