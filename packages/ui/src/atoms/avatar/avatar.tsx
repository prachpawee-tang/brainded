import { Image, View } from 'react-native'
import { cn } from '../../lib/cn'
import { Text } from '../text/text'

export type AvatarSize = 'md' | 'lg' | 'xl'

export type AvatarProps = {
  /** Accessible name (e.g. the pet's name). */
  label: string
  imageUrl?: string | null
  /** Emoji shown when there is no photo. */
  fallback: string
  /** Hex background behind the fallback (module accent). */
  accentColor: string
  size?: AvatarSize
  className?: string
}

const SIZE_CLASSES: Record<AvatarSize, { box: string; glyph: string }> = {
  md: { box: 'size-12 rounded-lg', glyph: 'text-xl' },
  lg: { box: 'size-20 rounded-xl', glyph: 'text-3xl' },
  xl: { box: 'size-28 rounded-xl', glyph: 'text-5xl' },
}

export const Avatar = ({
  label,
  imageUrl,
  fallback,
  accentColor,
  size = 'md',
  className,
}: AvatarProps) => {
  const classes = SIZE_CLASSES[size]
  if (imageUrl) {
    return (
      <Image
        accessibilityLabel={label}
        accessibilityRole="image"
        source={{ uri: imageUrl }}
        className={cn(classes.box, 'bg-surface-muted', className)}
      />
    )
  }
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityRole="image"
      className={cn(classes.box, 'items-center justify-center', className)}
      style={{ backgroundColor: accentColor }}
    >
      <Text className={cn(classes.glyph, 'leading-normal')}>{fallback}</Text>
    </View>
  )
}
