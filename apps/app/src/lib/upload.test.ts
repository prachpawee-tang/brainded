import { Platform } from 'react-native'
import { uploadPhoto } from './upload'

jest.mock('./auth-client', () => ({ authClient: { getCookie: jest.fn(() => 'session=abc') } }))

const okResponse = () => new Response(JSON.stringify({ key: 'u1/uploads/x.jpg' }), { status: 201 })

describe('uploadPhoto', () => {
  const originalOS = Platform.OS
  afterEach(() => {
    Platform.OS = originalOS
  })

  it('posts the file with the session cookie on native and returns the key', async () => {
    Platform.OS = 'ios'
    const fetchMock = jest.fn(async () => okResponse())
    global.fetch = fetchMock as unknown as typeof fetch
    await expect(
      uploadPhoto({ uri: 'file:///cat.jpg', mimeType: 'image/jpeg', fileName: 'cat.jpg' }),
    ).resolves.toBe('u1/uploads/x.jpg')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toMatch(/\/api\/files$/)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).cookie).toBe('session=abc')
    expect(init.body).toBeInstanceOf(FormData)
  })

  it('uses browser cookies on web and sends a Blob', async () => {
    Platform.OS = 'web'
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(new Response(new Blob(['img'], { type: 'image/png' })))
      .mockResolvedValueOnce(okResponse())
    global.fetch = fetchMock as unknown as typeof fetch
    await uploadPhoto({ uri: 'blob:http://x/1', mimeType: 'image/png' })
    const [, init] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(init.credentials).toBe('include')
    expect((init.headers as Record<string, string>).cookie).toBeUndefined()
  })

  it('throws with the server code when the upload is rejected', async () => {
    Platform.OS = 'ios'
    global.fetch = jest.fn(
      async () => new Response(JSON.stringify({ code: 'FILE_TOO_LARGE' }), { status: 413 }),
    ) as unknown as typeof fetch
    await expect(uploadPhoto({ uri: 'file:///big.jpg' })).rejects.toThrow('FILE_TOO_LARGE')
  })
})
