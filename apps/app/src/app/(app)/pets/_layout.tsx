import { PetsServicesProvider } from '@brain/module-pets/app'
import { Stack } from 'expo-router'
import { uploadPhoto } from '@/lib/upload'

const SERVICES = { uploadPhoto }

export default function PetsLayout() {
  return (
    <PetsServicesProvider value={SERVICES}>
      <Stack screenOptions={{ headerShown: false }} />
    </PetsServicesProvider>
  )
}
