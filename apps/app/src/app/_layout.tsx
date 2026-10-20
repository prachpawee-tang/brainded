import '../global.css'
import {
  IBMPlexSansThai_400Regular,
  IBMPlexSansThai_500Medium,
  IBMPlexSansThai_700Bold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-sans-thai'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import type { i18n as I18n } from 'i18next'
import { useEffect, useState } from 'react'
import { createApolloClient } from '@/lib/apollo'
import { authClient } from '@/lib/auth-client'
import { detectLanguage } from '@/lib/detect-language'
import { initI18n } from '@/lib/i18n'
import { AppProviders } from '@/providers/app-providers'

SplashScreen.preventAutoHideAsync()

const client = createApolloClient({ getCookie: () => authClient.getCookie() })

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansThai_400Regular,
    IBMPlexSansThai_500Medium,
    IBMPlexSansThai_700Bold,
  })
  const [i18n, setI18n] = useState<I18n | null>(null)
  const { data: session, isPending } = authClient.useSession()
  const userId = session?.user.id

  useEffect(() => {
    initI18n(detectLanguage()).then(setI18n)
  }, [])

  // Never show one user's cached data to another.
  // biome-ignore lint/correctness/useExhaustiveDependencies: userId is the trigger, not an input.
  useEffect(() => {
    client.clearStore()
  }, [userId])

  const isReady = fontsLoaded && i18n !== null && !isPending

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync()
  }, [isReady])

  if (!isReady) return null

  return (
    <AppProviders i18n={i18n} client={client}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={Boolean(userId)}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!userId}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
        </Stack.Protected>
      </Stack>
    </AppProviders>
  )
}
