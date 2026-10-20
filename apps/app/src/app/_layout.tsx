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
import { detectLanguage } from '@/lib/detect-language'
import { initI18n } from '@/lib/i18n'
import { AppProviders } from '@/providers/app-providers'

SplashScreen.preventAutoHideAsync()

const client = createApolloClient()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansThai_400Regular,
    IBMPlexSansThai_500Medium,
    IBMPlexSansThai_700Bold,
  })
  const [i18n, setI18n] = useState<I18n | null>(null)

  useEffect(() => {
    initI18n(detectLanguage()).then(setI18n)
  }, [])

  const isReady = fontsLoaded && i18n !== null

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync()
  }, [isReady])

  if (!isReady) return null

  return (
    <AppProviders i18n={i18n} client={client}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  )
}
