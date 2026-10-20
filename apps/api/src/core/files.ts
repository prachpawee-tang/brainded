import type { Auth } from '@brain/auth'
import { buildObjectKey, type ObjectStorage } from '@brain/storage'
import type { Hono } from 'hono'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
}

/** `POST /api/files` — authenticated image upload. Returns `{ key }` to attach to an entity (e.g. `photoKey`). */
export const registerFileRoutes = (
  app: Hono,
  { auth, storage }: { auth: Auth; storage: ObjectStorage },
) => {
  app.post('/api/files', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ code: 'UNAUTHENTICATED' }, 401)

    const form = await c.req.formData().catch(() => null)
    const file = form?.get('file')
    if (!(file instanceof File)) return c.json({ code: 'FILE_REQUIRED' }, 400)

    const extension = EXTENSIONS[file.type]
    if (!extension) return c.json({ code: 'UNSUPPORTED_FILE_TYPE' }, 415)
    if (file.size > MAX_UPLOAD_BYTES) return c.json({ code: 'FILE_TOO_LARGE' }, 413)

    const key = buildObjectKey({ ownerId: session.user.id, folder: 'uploads', extension })
    await storage.put(key, new Uint8Array(await file.arrayBuffer()), file.type)
    return c.json({ key }, 201)
  })
}
