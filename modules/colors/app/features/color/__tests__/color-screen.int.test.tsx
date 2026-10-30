import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { setStringAsync } from 'expo-clipboard'
import { router, useLocalSearchParams } from 'expo-router'
import { SetColorFavoriteMutation } from '../../../graphql/favorites'
import { favoritesMock, renderColors } from '../../../test/render'
import { ColorScreen } from '../screens/color-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}))
jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => true) }))

const params = useLocalSearchParams as jest.Mock

describe('ColorScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    params.mockReturnValue({ slug: 'hermosa-pink' })
  })

  it('shows the codes and copies one', async () => {
    const user = userEvent.setup()
    await renderColors(<ColorScreen />)
    expect(screen.getByRole('header', { name: 'Hermosa Pink' })).toBeOnTheScreen()
    expect(screen.getByText('#f9c1ce')).toBeOnTheScreen()
    expect(screen.getByText('249, 193, 206')).toBeOnTheScreen()
    expect(screen.getByText('0, 30, 6, 0')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Copy RGB' }))
    expect(setStringAsync).toHaveBeenCalledWith('rgb(249, 193, 206)')
    expect(await screen.findByText('Copied')).toBeOnTheScreen()
  })

  it('lists its combinations and opens one', async () => {
    const user = userEvent.setup()
    await renderColors(<ColorScreen />)
    expect(screen.getByText('In 3 combinations')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: /^No\. 227,/ }))
    expect(router.push).toHaveBeenCalledWith('/colors/combinations/227')
  })

  it('adds it to favorites', async () => {
    const user = userEvent.setup()
    const result = jest.fn(() => ({
      data: {
        setColorFavorite: {
          __typename: 'MutationSetColorFavoriteSuccess',
          data: [{ __typename: 'ColorFavorite', id: 'f1', kind: 'COLOR', ref: 'hermosa-pink' }],
        },
      },
    }))
    await renderColors(<ColorScreen />, {
      mocks: [
        favoritesMock(),
        {
          request: {
            query: SetColorFavoriteMutation,
            variables: { input: { kind: 'COLOR', ref: 'hermosa-pink', isFavorite: true } },
          },
          result,
        },
      ],
    })
    await user.press(await screen.findByRole('button', { name: 'Add to favorites' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(await screen.findByRole('button', { name: 'Remove from favorites' })).toBeOnTheScreen()
  })

  it('handles an unknown color', async () => {
    params.mockReturnValue({ slug: 'nope' })
    await renderColors(<ColorScreen />)
    expect(screen.getByText("This color doesn't exist")).toBeOnTheScreen()
  })
})
