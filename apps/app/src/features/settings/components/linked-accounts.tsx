import { Button, Text } from '@brain/ui'
import { createURL } from 'expo-linking'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { authErrorKey } from '@/features/auth/lib/auth-error'
import { authClient } from '@/lib/auth-client'

type LinkedAccount = { id: string; providerId: string }

/** Social providers the user can connect. Add 'facebook' / 'apple' once configured on the API. */
const LINKABLE_PROVIDERS = ['google'] as const

export const LinkedAccounts = () => {
  const { t } = useTranslation('app')
  const [accounts, setAccounts] = useState<LinkedAccount[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const { data } = await authClient.listAccounts()
    setAccounts(data ?? [])
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const unlink = async (account: LinkedAccount) => {
    setError(null)
    const { error: unlinkError } = await authClient.unlinkAccount({ accountId: account.id })
    if (unlinkError) setError(authErrorKey(unlinkError))
    await refresh()
  }

  const providerLabel = (providerId: string) =>
    t(`settings.providers.${providerId}`, { defaultValue: providerId })

  const linked = new Set(accounts.map((account) => account.providerId))
  const canUnlink = accounts.length > 1

  return (
    <View className="gap-2">
      {accounts.map((account) => (
        <View key={account.id} className="h-12 flex-row items-center justify-between">
          <Text>{providerLabel(account.providerId)}</Text>
          {canUnlink ? (
            <Button
              variant="ghost"
              size="sm"
              label={t('settings.unlink')}
              onPress={() => unlink(account)}
            />
          ) : null}
        </View>
      ))}
      {LINKABLE_PROVIDERS.filter((provider) => !linked.has(provider)).map((provider) => (
        <Button
          key={provider}
          variant="secondary"
          size="sm"
          label={t('settings.link', { provider: providerLabel(provider) })}
          onPress={() => authClient.linkSocial({ provider, callbackURL: createURL('/settings') })}
        />
      ))}
      {error ? (
        <Text accessibilityRole="alert" tone="danger" variant="caption">
          {t(error)}
        </Text>
      ) : null}
    </View>
  )
}
