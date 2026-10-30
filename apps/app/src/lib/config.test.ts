import { resolveApiOrigin } from './config'

describe('resolveApiOrigin', () => {
  it('defaults to the local API', () => {
    expect(resolveApiOrigin(undefined, null)).toBe('http://localhost:4000')
  })

  it('uses an explicit origin', () => {
    expect(resolveApiOrigin('https://api.example.com', 'https://app.example.com')).toBe(
      'https://api.example.com',
    )
  })

  it('follows the page when hosted on one domain (same-origin)', () => {
    expect(resolveApiOrigin('same-origin', 'https://brain.example.workers.dev')).toBe(
      'https://brain.example.workers.dev',
    )
  })

  it('falls back to local when same-origin has no page (native)', () => {
    expect(resolveApiOrigin('same-origin', null)).toBe('http://localhost:4000')
  })
})
