import { Alert, Platform } from 'react-native'
import { confirmAction } from './confirm'

const LABELS = { confirm: 'Archive', cancel: 'Cancel' }

describe('confirmAction', () => {
  const originalOS = Platform.OS
  afterEach(() => {
    Platform.OS = originalOS
    jest.restoreAllMocks()
  })

  it.each([
    [0, false],
    [1, true],
  ])('resolves the native alert button %d as %s', async (index, expected) => {
    jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_t, _m, buttons) => buttons?.[index]?.onPress?.())
    await expect(confirmAction('Sure?', LABELS)).resolves.toBe(expected)
  })

  it('uses window.confirm on web', async () => {
    Platform.OS = 'web'
    const original = global.window.confirm
    global.window.confirm = jest.fn(() => true)
    await expect(confirmAction('Sure?', LABELS)).resolves.toBe(true)
    global.window.confirm = original
  })
})
