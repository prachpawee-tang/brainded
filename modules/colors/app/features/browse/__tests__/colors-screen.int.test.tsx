import { screen, userEvent } from '@testing-library/react-native'
import { router } from 'expo-router'
import { favoritesMock, renderColors } from '../../../test/render'
import { ColorsScreen } from '../screens/colors-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, push: jest.fn(), back: jest.fn() },
}))

describe('ColorsScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lists combinations, filters by size and pages through them', async () => {
    const user = userEvent.setup()
    await renderColors(<ColorsScreen />)
    expect(screen.getByRole('button', { name: /^No\. 1,/ })).toBeOnTheScreen()
    expect(screen.queryByRole('button', { name: /^No\. 348,/ })).not.toBeOnTheScreen()
    await user.press(screen.getByRole('radio', { name: '4 colors' }))
    const first = screen.getAllByRole('button', { name: /^No\. \d+,/ })[0]
    expect(first?.props.accessibilityLabel.split(',').length).toBe(5)
    await user.press(screen.getByRole('button', { name: 'Show more' }))
    await user.press(screen.getAllByRole('button', { name: /^No\. \d+,/ })[0] as never)
    expect(router.push).toHaveBeenCalledWith(expect.stringMatching(/^\/colors\/combinations\/\d+$/))
  })

  it('shows every color and opens one', async () => {
    const user = userEvent.setup()
    await renderColors(<ColorsScreen />)
    await user.press(screen.getByRole('radio', { name: 'Colors' }))
    await user.press(screen.getByRole('button', { name: 'Hermosa Pink' }))
    expect(router.push).toHaveBeenCalledWith('/colors/hermosa-pink')
  })

  it('searches by name and by HEX (nearest colors)', async () => {
    const user = userEvent.setup()
    await renderColors(<ColorsScreen />)
    const search = screen.getByLabelText('Search by name or HEX (e.g. #f9c1ce)')
    await user.type(search, 'hermosa')
    expect(screen.getByRole('button', { name: 'Hermosa Pink, #f9c1ce' })).toBeOnTheScreen()
    await user.clear(search)
    await user.type(search, '#f8c0cd')
    expect(
      screen.getByRole('button', { name: /^Hermosa Pink, #f9c1ce, Almost exact/ }),
    ).toBeOnTheScreen()
    await user.clear(search)
    await user.type(search, 'zzz')
    expect(screen.getByText('No colors match')).toBeOnTheScreen()
  })

  it('shows favorites, or how to add them', async () => {
    const user = userEvent.setup()
    await renderColors(<ColorsScreen />, {
      mocks: [
        favoritesMock([
          { kind: 'COMBINATION', ref: '176' },
          { kind: 'COLOR', ref: 'hermosa-pink' },
        ]),
      ],
    })
    await user.press(screen.getByRole('radio', { name: 'Favorites' }))
    expect(await screen.findByRole('button', { name: /^No\. 176,/ })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Hermosa Pink, #f9c1ce' })).toBeOnTheScreen()
  })

  it('says how to add favorites when there are none', async () => {
    const user = userEvent.setup()
    await renderColors(<ColorsScreen />)
    await user.press(screen.getByRole('radio', { name: 'Favorites' }))
    expect(await screen.findByText(/Tap ♡/)).toBeOnTheScreen()
  })
})
