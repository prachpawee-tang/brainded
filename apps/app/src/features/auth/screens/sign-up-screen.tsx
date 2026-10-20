import { Button, Text, TextField } from '@brain/ui'
import { router } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { ScreenLayout } from '@/components/screen-layout'
import { authClient } from '@/lib/auth-client'
import { authErrorKey } from '../lib/auth-error'
import { useFieldErrors } from '../lib/use-field-errors'
import { signUpSchema } from '../lib/validation'

const EMPTY_FORM = { name: '', username: '', email: '', password: '' }
type Field = keyof typeof EMPTY_FORM

export const SignUpScreen = () => {
  const { t } = useTranslation('app')
  const [form, setForm] = useState(EMPTY_FORM)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { errors, validate } = useFieldErrors(signUpSchema)

  const fieldProps = (field: Field) => ({
    label: t(`auth.signUp.${field}`),
    value: form[field],
    onChangeText: (value: string) => setForm((current) => ({ ...current, [field]: value })),
    error: errors[field] && t(errors[field]),
  })

  const submit = async () => {
    const input = validate(form)
    if (!input) return
    setIsSubmitting(true)
    setServerError(null)
    const { error } = await authClient.signUp.email(input)
    setIsSubmitting(false)
    if (error) setServerError(authErrorKey(error))
  }

  return (
    <ScreenLayout centered>
      <View className="gap-2">
        <Text variant="display">{t('auth.signUp.title')}</Text>
        <Text tone="muted">{t('auth.signUp.subtitle')}</Text>
      </View>

      <View className="gap-4">
        <TextField {...fieldProps('name')} autoComplete="name" />
        <TextField {...fieldProps('username')} autoCapitalize="none" autoComplete="username-new" />
        <TextField
          {...fieldProps('email')}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextField
          {...fieldProps('password')}
          secureTextEntry
          autoComplete="new-password"
          onSubmitEditing={submit}
        />
        {serverError ? (
          <Text accessibilityRole="alert" tone="danger" variant="caption">
            {t(serverError)}
          </Text>
        ) : null}
        <Button label={t('auth.signUp.submit')} onPress={submit} loading={isSubmitting} />
      </View>

      <Button
        variant="ghost"
        label={t('auth.signUp.haveAccount')}
        onPress={() => router.replace('/sign-in')}
      />
    </ScreenLayout>
  )
}
