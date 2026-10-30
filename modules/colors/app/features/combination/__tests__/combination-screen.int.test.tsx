import { screen, userEvent } from '@testing-library/react-native'
import { setStringAsync } from 'expo-clipboard'
import { router, useLocalSearchParams } from 'expo-router'
import { getCombination } from '../../../../shared/palette'
import { renderColors } from '../../../test/render'
import { CombinationScreen } from '../screens/combination-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}))
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }))

const params = useLocalSearchParams as jest.Mock

describe('CombinationScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows each color as a band, opens one and copies all codes', async () => {
    params.mockReturnValue({ n: '176' })
    const user = userEvent.setup()
    const colors = getCombination(176)?.colors ?? []
    await renderColors(<CombinationScreen />)
    expect(screen.getByRole('header', { name: 'No. 176' })).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Hermosa Pink, #f9c1ce' }))
    expect(router.push).toHaveBeenCalledWith('/colors/hermosa-pink')
    await user.press(screen.getByRole('button', { name: 'Copy all HEX codes' }))
    expect(setStringAsync).toHaveBeenCalledWith(colors.map((c) => c.hex).join(' '))
  })

  it('handles an unknown number', async () => {
    params.mockReturnValue({ n: '999' })
    await renderColors(<CombinationScreen />)
    expect(screen.getByText("This combination doesn't exist")).toBeOnTheScreen()
  })
})
