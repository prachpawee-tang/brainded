import type { LucideIcon } from 'lucide-react-native'
import { ActivityIndicator, Pressable, type PressableProps } from 'react-native'
import { cn } from '../../lib/cn'
import { Icon } from '../icon/icon'
import { Text, type TextTone } from '../text/text'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = Omit<PressableProps, 'children'> & {
  /** Already-translated label. */
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** Optional leading icon (lucide). */
  icon?: LucideIcon
  className?: string
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-primary-soft',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
}

const LABEL_TONE: Record<ButtonVariant, TextTone> = {
  primary: 'onPrimary',
  secondary: 'primary',
  ghost: 'primary',
  danger: 'onPrimary',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3',
  md: 'h-12 px-5',
  lg: 'h-14 px-6',
}

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled = false,
  className,
  ...props
}: ButtonProps) => {
  const isInactive = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-lg',
        'active:scale-95 active:opacity-90 disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {loading && <ActivityIndicator testID="button-spinner" size="small" />}
      {icon && !loading ? (
        <Icon
          testID="button-icon"
          icon={icon}
          size={size === 'sm' ? 'sm' : 'md'}
          tone={LABEL_TONE[variant]}
        />
      ) : null}
      <Text
        variant={size === 'sm' ? 'caption' : 'body'}
        tone={LABEL_TONE[variant]}
        className="font-sans-medium"
      >
        {label}
      </Text>
    </Pressable>
  )
}
