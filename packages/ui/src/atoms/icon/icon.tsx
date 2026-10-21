import type { LucideIcon } from 'lucide-react-native'
import { useThemeColors } from '../../lib/use-theme-colors'
import type { SemanticColors } from '../../tokens/color'

export type IconSize = 'sm' | 'md' | 'lg'
export type IconTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'onPrimary'
  | 'danger'
  | 'success'
  | 'warning'

const SIZES: Record<IconSize, number> = { sm: 16, md: 20, lg: 24 }
const STROKE_WIDTH = 2

const TONE_COLOR: Record<IconTone, keyof SemanticColors> = {
  default: 'text',
  muted: 'textMuted',
  primary: 'primary',
  onPrimary: 'onPrimary',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
}

export type IconProps = { icon: LucideIcon; size?: IconSize; tone?: IconTone; testID?: string }

/** Decorative line icon (lucide) in a semantic color. The parent control carries the accessible name. */
export const Icon = ({ icon: Glyph, size = 'md', tone = 'default', testID }: IconProps) => {
  const colors = useThemeColors()
  return (
    <Glyph
      testID={testID}
      size={SIZES[size]}
      color={colors[TONE_COLOR[tone]]}
      strokeWidth={STROKE_WIDTH}
      // Decorative: hidden from assistive tech on both native and web (no RN-only props, they leak to the DOM).
      aria-hidden
    />
  )
}
