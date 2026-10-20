import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v7 as uuidv7 } from 'uuid'

const DEFAULT_URL_TTL_SECONDS = 3600
const SAFE_KEY_PART = /^[a-z0-9-]+$/i

/** Vendor-neutral object storage. Domain code depends on this, never on an SDK. */
export type ObjectStorage = {
  put: (key: string, body: Uint8Array, contentType: string) => Promise<void>
  /** Short-lived URL a browser/app can read the object from. */
  getUrl: (key: string, expiresInSeconds?: number) => Promise<string>
  delete: (key: string) => Promise<void>
}

/** `<ownerId>/<folder>/<uuidv7>.<ext>` — owner prefix keeps users' files apart. */
export const buildObjectKey = ({
  ownerId,
  folder,
  extension,
}: {
  ownerId: string
  folder: string
  extension: string
}): string => {
  for (const part of [ownerId, folder, extension]) {
    if (!SAFE_KEY_PART.test(part)) throw new Error(`Invalid object key part: ${part}`)
  }
  return `${ownerId}/${folder}/${uuidv7()}.${extension}`
}

/** Any S3-compatible service: Neon Object Storage, Cloudflare R2, AWS S3, MinIO. */
export const createS3Storage = ({
  bucket,
  client,
}: {
  bucket: string
  client: S3Client
}): ObjectStorage => ({
  put: async (key, body, contentType) => {
    await client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
    )
  },
  getUrl: (key, expiresInSeconds = DEFAULT_URL_TTL_SECONDS) =>
    getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    }),
  delete: async (key) => {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  },
})

type StoredObject = { body: Uint8Array; contentType: string }

/** In-memory storage for tests and offline dev. */
export const createMemoryStorage = (): ObjectStorage & { objects: Map<string, StoredObject> } => {
  const objects = new Map<string, StoredObject>()
  return {
    objects,
    put: async (key, body, contentType) => {
      objects.set(key, { body, contentType })
    },
    getUrl: async (key) => `memory://${key}`,
    delete: async (key) => {
      objects.delete(key)
    },
  }
}
