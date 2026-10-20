import { expoClient } from '@better-auth/expo/client'
import { usernameClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import * as SecureStore from 'expo-secure-store'
import { API_ORIGIN, APP_SCHEME } from './config'

/**
 * Better Auth client. Web: cookies via `credentials: include`.
 * Native: the Expo plugin stores the session cookie in SecureStore (see `getCookie`).
 */
export const authClient = createAuthClient({
  baseURL: API_ORIGIN,
  plugins: [
    usernameClient(),
    expoClient({ scheme: APP_SCHEME, storagePrefix: APP_SCHEME, storage: SecureStore }),
  ],
})
