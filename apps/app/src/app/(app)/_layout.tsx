import { useQuery } from '@apollo/client/react'
import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { usePreferencesSync } from '@/features/preferences/use-preferences-sync'
import { ViewerQuery } from '@/features/viewer/graphql/viewer'

export default function SignedInLayout() {
  const { i18n } = useTranslation()
  const { data } = useQuery(ViewerQuery)
  usePreferencesSync(i18n, data?.viewer)
  return <Stack screenOptions={{ headerShown: false }} />
}
