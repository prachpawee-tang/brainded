import { Button, ScreenLayout, Text, TextField } from '@brain/ui'
import { createURL } from 'expo-linking'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { authClient } from '@/lib/auth-client'
import { authErrorKey } from '../lib/auth-error'
import { useFieldErrors } from '../lib/use-field-errors'
import { signInSchema } from '../lib/validation'

export const SignInScreen = () => {
  const { t } = useTranslation('app')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { errors, validate } = useFieldErrors(signInSchema)

  const submit = async () => {
    const input = validate({ identifier, password })
    if (!input) return
    setIsSubmitting(true)
    setServerError(null)
    const { error } = input.identifier.includes('@')
      ? await authClient.signIn.email({ email: input.identifier, password: input.password })
      : await authClient.signIn.username({ username: input.identifier, password: input.password })
    setIsSubmitting(false)
    if (error) setServerError(authErrorKey(error))
    // On success the session changes and the root layout swaps to the signed-in stack.
  }

  const signInWithGoogle = () =>
    authClient.signIn.social({ provider: 'google', callbackURL: createURL('/') })

  return (
    <ScreenLayout centered>
      <View className="gap-2">
        <Text variant="display">{t('auth.signIn.title')}</Text>
        <Text tone="muted">{t('auth.signIn.subtitle')}</Text>
      </View>

      <Button variant="secondary" label={t('auth.signIn.google')} onPress={signInWithGoogle} />

      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />
        <Text variant="caption" tone="muted">
          {t('auth.signIn.or')}
        </Text>
        <View className="h-px flex-1 bg-border" />
      </View>

      <View className="gap-4">
        <TextField
          label={t('auth.signIn.identifier')}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoComplete="username"
          error={errors.identifier && t(errors.identifier)}
        />
        <TextField
          label={t('auth.signIn.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          onSubmitEditing={submit}
          error={errors.password && t(errors.password)}
        />
        {serverError ? (
          <Text accessibilityRole="alert" tone="danger" variant="caption">
            {t(serverError)}
          </Text>
        ) : null}
        <Button label={t('auth.signIn.submit')} onPress={submit} loading={isSubmitting} />
      </View>

      <Button
        variant="ghost"
        label={t('auth.signIn.noAccount')}
        onPress={() => router.push('/sign-up')}
      />
    </ScreenLayout>
  )
}
