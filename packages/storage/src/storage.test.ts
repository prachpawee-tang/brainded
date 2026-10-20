import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import { validate, version } from 'uuid'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildObjectKey, createMemoryStorage, createS3Storage } from './storage'

const OWNER = '0190f0f0-0000-7000-8000-000000000001'
const BYTES = new Uint8Array([1, 2, 3])

describe('buildObjectKey', () => {
  it('namespaces keys by owner and folder with a UUIDv7 file name', () => {
    const key = buildObjectKey({ ownerId: OWNER, folder: 'pets', extension: 'jpg' })
    const [owner, folder, file] = key.split('/')
    expect(owner).toBe(OWNER)
    expect(folder).toBe('pets')
    const [id, ext] = (file ?? '').split('.')
    expect(validate(id ?? '') && version(id ?? '')).toBe(7)
    expect(ext).toBe('jpg')
  })

  it('rejects folders and extensions with unsafe characters', () => {
    expect(() => buildObjectKey({ ownerId: OWNER, folder: '../x', extension: 'jpg' })).toThrow(
      'Invalid object key part',
    )
    expect(() => buildObjectKey({ ownerId: OWNER, folder: 'pets', extension: 'j/pg' })).toThrow(
      'Invalid object key part',
    )
  })
})

describe('createMemoryStorage', () => {
  it('stores, reads back and deletes objects', async () => {
    const storage = createMemoryStorage()
    await storage.put('a/b.jpg', BYTES, 'image/jpeg')
    expect(storage.objects.get('a/b.jpg')).toEqual({ body: BYTES, contentType: 'image/jpeg' })
    expect(await storage.getUrl('a/b.jpg')).toBe('memory://a/b.jpg')
    await storage.delete('a/b.jpg')
    expect(storage.objects.has('a/b.jpg')).toBe(false)
  })
})

describe('createS3Storage', () => {
  const s3 = mockClient(S3Client)
  beforeEach(() => s3.reset())

  const storage = () =>
    createS3Storage({
      bucket: 'brain-files',
      client: new S3Client({
        region: 'ap-southeast-1',
        endpoint: 'https://s3.example.test',
        forcePathStyle: true,
        credentials: { accessKeyId: 'id', secretAccessKey: 'secret' },
      }),
    })

  it('uploads with the content type', async () => {
    await storage().put('k.jpg', BYTES, 'image/jpeg')
    expect(s3.commandCalls(PutObjectCommand)[0]?.args[0].input).toMatchObject({
      Bucket: 'brain-files',
      Key: 'k.jpg',
      ContentType: 'image/jpeg',
    })
  })

  it('deletes objects', async () => {
    await storage().delete('k.jpg')
    expect(s3.commandCalls(DeleteObjectCommand)[0]?.args[0].input).toEqual({
      Bucket: 'brain-files',
      Key: 'k.jpg',
    })
  })

  it('returns a short-lived presigned GET url', async () => {
    const url = new URL(await storage().getUrl('k.jpg', 600))
    expect(url.pathname).toBe('/brain-files/k.jpg')
    expect(url.searchParams.get('X-Amz-Expires')).toBe('600')
    expect(s3.commandCalls(GetObjectCommand)).toHaveLength(0)
  })
})
