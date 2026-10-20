import { describe, expect, it } from 'vitest'
import { createTestApp, TEST_APP_ORIGIN } from '../test/create-test-app'

const upload = (
  app: Awaited<ReturnType<typeof createTestApp>>['app'],
  file: File | null,
  cookie?: string,
) => {
  const form = new FormData()
  if (file) form.append('file', file)
  return app.request('/api/files', {
    method: 'POST',
    body: form,
    headers: { origin: TEST_APP_ORIGIN, ...(cookie ? { cookie } : {}) },
  })
}

const jpeg = (bytes = 10) => new File([new Uint8Array(bytes)], 'cat.jpg', { type: 'image/jpeg' })

describe('POST /api/files', () => {
  it('requires a session', async () => {
    const { app } = await createTestApp()
    expect((await upload(app, jpeg())).status).toBe(401)
  })

  it("stores an image under the user's prefix and returns its key", async () => {
    const { app, signUp, storage, gql } = await createTestApp()
    const cookie = await signUp()
    const res = await upload(app, jpeg(), cookie)
    expect(res.status).toBe(201)
    const { key } = (await res.json()) as { key: string }
    const viewer = await gql<{ viewer: { id: string } }>('{ viewer { id } }', { cookie })
    expect(key).toMatch(new RegExp(`^${viewer.data?.viewer.id}/uploads/[0-9a-f-]+\\.jpg$`))
    expect(storage.objects.get(key)?.contentType).toBe('image/jpeg')
  })

  it('rejects non-images', async () => {
    const { app, signUp } = await createTestApp()
    const cookie = await signUp()
    const res = await upload(app, new File(['hi'], 'a.txt', { type: 'text/plain' }), cookie)
    expect(res.status).toBe(415)
    expect(await res.json()).toEqual({ code: 'UNSUPPORTED_FILE_TYPE' })
  })

  it('rejects files over 5 MB', async () => {
    const { app, signUp } = await createTestApp()
    const cookie = await signUp()
    const res = await upload(app, jpeg(5 * 1024 * 1024 + 1), cookie)
    expect(res.status).toBe(413)
    expect(await res.json()).toEqual({ code: 'FILE_TOO_LARGE' })
  })

  it('requires a file field', async () => {
    const { app, signUp } = await createTestApp()
    const cookie = await signUp()
    expect((await upload(app, null, cookie)).status).toBe(400)
  })
})

describe('pets module is registered', () => {
  it('creates and lists pets through the composed API', async () => {
    const { gql, signUp } = await createTestApp()
    const cookie = await signUp()
    await gql('mutation { createPet(input: { name: "Mango", species: CAT }) { __typename } }', {
      cookie,
    })
    const { data } = await gql<{ pets: { edges: { node: { name: string } }[] } }>(
      '{ pets { edges { node { name } } } }',
      { cookie },
    )
    expect(data?.pets.edges.map((e) => e.node.name)).toEqual(['Mango'])
  })
})
