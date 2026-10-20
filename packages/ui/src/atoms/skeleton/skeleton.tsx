import { View } from 'react-native'
import { cn } from '../../lib/cn'

/** Loading placeholder. Hidden from assistive tech; pair with a busy/label on the container. */
export const Skeleton = ({ className, testID }: { className?: string; testID?: string }) => (
  <View
    testID={testID}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    aria-hidden
    className={cn('animate-pulse rounded-md bg-surface-muted', className)}
  />
)
