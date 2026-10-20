import { Text as RNText, type TextProps as RNTextProps } from 'react-native'
import { cn } from '../../lib/cn'

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'caption'
export type TextTone = 'default' | 'muted' | 'primary' | 'danger' | 'onPrimary'

export type TextProps = RNTextProps & {
  variant?: TextVariant
  tone?: TextTone
}

const VARIANT_CLASSES: Record<TextVariant, string> = {
  display: 'font-sans-bold text-3xl',
  title: 'font-sans-bold text-2xl',
  heading: 'font-sans-medium text-lg',
  body: 'font-sans text-base',
  caption: 'font-sans text-sm',
}

const TONE_CLASSES: Record<TextTone, string> = {
  default: 'text-text',
  muted: 'text-text-muted',
  primary: 'text-primary',
  danger: 'text-danger',
  onPrimary: 'text-on-primary',
}

const HEADER_VARIANTS: ReadonlySet<TextVariant> = new Set(['display', 'title'])

export const Text = ({ variant = 'body', tone = 'default', className, ...props }: TextProps) => (
  <RNText
    accessibilityRole={HEADER_VARIANTS.has(variant) ? 'header' : undefined}
    className={cn(VARIANT_CLASSES[variant], TONE_CLASSES[tone], className)}
    {...props}
  />
)
