import type { LucideIcon } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { cn } from '../../lib/cn'
import { Icon, type IconTone } from '../icon/icon'

export type IconButtonVariant = 'ghost' | 'soft' | 'primary'

export type IconButtonProps = {
  icon: LucideIcon
  /** Already-translated accessible name — required, since there is no visible text. */
  label: string
  onPress: () => void
  variant?: IconButtonVariant
  disabled?: boolean
  className?: string
}

const VARIANT: Record<IconButtonVariant, { box: string; tone: IconTone }> = {
  ghost: { box: 'bg-transparent', tone: 'default' },
  soft: { box: 'bg-primary-soft', tone: 'primary' },
  primary: { box: 'bg-primary', tone: 'onPrimary' },
}

/** 44×44 round icon-only button (meets touch-target size). */
export const IconButton = ({
  icon,
  label,
  onPress,
  variant = 'ghost',
  disabled = false,
  className,
}: IconButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    hitSlop={4}
    className={cn(
      'size-11 items-center justify-center rounded-full active:scale-90 active:opacity-80 disabled:opacity-50',
      VARIANT[variant].box,
      className,
    )}
  >
    <Icon icon={icon} tone={VARIANT[variant].tone} />
  </Pressable>
)
