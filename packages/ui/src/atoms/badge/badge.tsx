import { View } from 'react-native'
import { cn } from '../../lib/cn'
import { Text } from '../text/text'

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

const TONE_CLASSES: Record<BadgeTone, { box: string; text: string }> = {
  neutral: { box: 'bg-surface-muted', text: 'text-text-muted' },
  primary: { box: 'bg-primary-soft', text: 'text-primary' },
  success: { box: 'bg-surface-muted', text: 'text-success' },
  warning: { box: 'bg-surface-muted', text: 'text-warning' },
  danger: { box: 'bg-surface-muted', text: 'text-danger' },
}

export const Badge = ({
  label,
  tone = 'neutral',
  className,
}: {
  label: string
  tone?: BadgeTone
  className?: string
}) => (
  <View className={cn('self-start rounded-full px-2.5 py-0.5', TONE_CLASSES[tone].box, className)}>
    <Text variant="caption" className={cn('font-sans-medium text-xs', TONE_CLASSES[tone].text)}>
      {label}
    </Text>
  </View>
)
