import { Icon, Text } from '@brain/ui'
import { router } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import type { WadaColor } from '../../shared/palette'

/** Swatch + name + HEX (+ how close it is, for HEX searches); opens the color. */
export const ColorRow = ({ color, match }: { color: WadaColor; match?: string }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={[color.name, color.hex, match].filter(Boolean).join(', ')}
    onPress={() => router.push(`/colors/${color.slug}`)}
    className="min-h-14 flex-row items-center gap-3 py-2 active:opacity-70"
  >
    <View
      className="size-10 rounded-md border border-border"
      style={{ backgroundColor: color.hex }}
    />
    <View className="flex-1">
      <Text className="font-sans-medium">{color.name}</Text>
      <Text variant="caption" tone="muted">
        {[color.hex, match].filter(Boolean).join(' · ')}
      </Text>
    </View>
    <Icon icon={ChevronRight} tone="muted" />
  </Pressable>
)
