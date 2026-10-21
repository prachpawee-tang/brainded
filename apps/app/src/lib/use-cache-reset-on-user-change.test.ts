import { renderHook } from '@testing-library/react-native'
import { useCacheResetOnUserChange } from './use-cache-reset-on-user-change'

const makeClient = () => ({
  resetStore: jest.fn(async () => []),
  clearStore: jest.fn(async () => []),
})

describe('useCacheResetOnUserChange', () => {
  it('does nothing on first render (the cache is already for this user)', async () => {
    const client = makeClient()
    await renderHook(() => useCacheResetOnUserChange(client, 'u1'))
    expect(client.resetStore).not.toHaveBeenCalled()
    expect(client.clearStore).not.toHaveBeenCalled()
  })

  it('resets and refetches active queries when a user signs in or switches', async () => {
    const client = makeClient()
    const { rerender } = await renderHook(
      ({ id }: { id?: string }) => useCacheResetOnUserChange(client, id),
      {
        initialProps: { id: undefined as string | undefined },
      },
    )
    await rerender({ id: 'u1' })
    expect(client.resetStore).toHaveBeenCalledTimes(1)
    await rerender({ id: 'u2' })
    expect(client.resetStore).toHaveBeenCalledTimes(2)
  })

  it('clears without refetching on sign-out', async () => {
    const client = makeClient()
    const { rerender } = await renderHook(
      ({ id }: { id?: string }) => useCacheResetOnUserChange(client, id),
      {
        initialProps: { id: 'u1' as string | undefined },
      },
    )
    await rerender({ id: undefined })
    expect(client.clearStore).toHaveBeenCalledTimes(1)
    expect(client.resetStore).not.toHaveBeenCalled()
  })

  it('ignores re-renders with the same user', async () => {
    const client = makeClient()
    const { rerender } = await renderHook(
      ({ id }: { id?: string }) => useCacheResetOnUserChange(client, id),
      {
        initialProps: { id: 'u1' as string | undefined },
      },
    )
    await rerender({ id: 'u1' })
    expect(client.resetStore).not.toHaveBeenCalled()
  })
})
