import { View } from 'react-native'
import { Button } from '../../atoms/button/button'
import { Text } from '../../atoms/text/text'
import { cn } from '../../lib/cn'

export type EmptyStateProps = {
  glyph: string
  /** Already-translated, friendly message. */
  message: string
  action?: { label: string; onPress: () => void }
  className?: string
}

export const EmptyState = ({ glyph, message, action, className }: EmptyStateProps) => (
  <View
    className={cn(
      'items-center gap-3 rounded-xl border border-dashed border-border p-8',
      className,
    )}
  >
    <Text className="text-4xl leading-normal">{glyph}</Text>
    <Text tone="muted" className="text-center">
      {message}
    </Text>
    {action ? (
      <Button variant="secondary" size="sm" label={action.label} onPress={action.onPress} />
    ) : null}
  </View>
)
