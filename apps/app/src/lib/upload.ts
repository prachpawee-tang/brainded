import type { PickedImage } from '@brain/module-pets/app'
import { Platform } from 'react-native'
import { authClient } from './auth-client'
import { API_ORIGIN } from './config'

const DEFAULT_MIME = 'image/jpeg'

/** Uploads a picked image to `POST /api/files` and resolves to its storage key. */
export const uploadPhoto = async ({ uri, mimeType, fileName }: PickedImage): Promise<string> => {
  const type = mimeType ?? DEFAULT_MIME
  const name = fileName ?? `photo.${type.split('/')[1] ?? 'jpg'}`
  const form = new FormData()
  const isWeb = Platform.OS === 'web'

  if (isWeb) {
    form.append('file', await (await fetch(uri)).blob(), name)
  } else {
    // React Native's FormData accepts a { uri, name, type } descriptor for local files.
    form.append('file', { uri, name, type } as unknown as Blob)
  }

  const cookie = isWeb ? null : await authClient.getCookie()
  const response = await fetch(`${API_ORIGIN}/api/files`, {
    method: 'POST',
    body: form,
    credentials: isWeb ? 'include' : 'omit',
    headers: cookie ? { cookie } : {},
  })
  const body = (await response.json().catch(() => ({}))) as { key?: string; code?: string }
  if (!response.ok || !body.key) throw new Error(body.code ?? 'UPLOAD_FAILED')
  return body.key
}
