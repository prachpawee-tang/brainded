import { IconButton, Text } from '@brain/ui'
import { Check, Copy } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

type Props = { label: string; value: string; isCopied: boolean; onCopy: () => void }

/** A code (HEX, RGB, CMYK) with a copy button that confirms in words, not only with an icon. */
export const CopyRow = ({ label, value, isCopied, onCopy }: Props) => {
  const { t } = useTranslation('colors')
  return (
    <View className="min-h-12 flex-row items-center gap-3">
      <Text variant="caption" tone="muted" className="w-14 font-sans-medium">
        {label}
      </Text>
      <Text className="flex-1 font-sans-medium" selectable>
        {value}
      </Text>
      {isCopied ? (
        <Text accessibilityLiveRegion="polite" tone="primary" variant="caption">
          {t('codes.copied')}
        </Text>
      ) : null}
      <IconButton
        icon={isCopied ? Check : Copy}
        label={t('codes.copy', { label })}
        onPress={onCopy}
      />
    </View>
  )
}
