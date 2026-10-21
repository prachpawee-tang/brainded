import { router } from 'expo-router'
import { goBack } from './navigation'

jest.mock('expo-router', () => ({
  router: { canGoBack: jest.fn(), back: jest.fn(), replace: jest.fn() },
}))
const canGoBack = router.canGoBack as jest.Mock

describe('goBack', () => {
  beforeEach(() => jest.clearAllMocks())

  it('goes back when there is history', () => {
    canGoBack.mockReturnValue(true)
    goBack('/pets')
    expect(router.back).toHaveBeenCalled()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('replaces with the parent screen when opened directly (reload, deep link)', () => {
    canGoBack.mockReturnValue(false)
    goBack('/pets')
    expect(router.replace).toHaveBeenCalledWith('/pets')
    expect(router.back).not.toHaveBeenCalled()
  })
})
