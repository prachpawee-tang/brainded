import { screen, userEvent } from '@testing-library/react-native'
import { router } from 'expo-router'
import { PetListQuery } from '../../../graphql/pets'
import { listMock } from '../../../test/fixtures'
import { renderPets } from '../../../test/render'
import { PetsScreen } from '../screens/pets-screen'

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }))

describe('PetsScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('invites adding the first pet with species shortcuts', async () => {
    const user = userEvent.setup()
    await renderPets(<PetsScreen />, { mocks: [listMock([])] })
    expect(await screen.findByText("No pets yet. Who's first?")).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Add a cat' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/pets/new', params: { species: 'CAT' } })
  })

  it('lists pets with species, age and latest weight', async () => {
    jest.useFakeTimers({
      now: new Date(2026, 9, 20),
      doNotFake: ['setTimeout', 'setInterval', 'queueMicrotask', 'nextTick', 'setImmediate'],
    })
    const user = userEvent.setup()
    await renderPets(<PetsScreen />, {
      mocks: [
        listMock([
          { id: 'p1', name: 'Mango', species: 'CAT', birthDate: '2024-07-20', weightGrams: 4200 },
          { id: 'p2', name: 'Bo', species: 'DOG' },
        ]),
      ],
    })
    expect(await screen.findByRole('button', { name: 'Mango' })).toBeOnTheScreen()
    expect(screen.getByText('Cat · 2 years 3 months')).toBeOnTheScreen()
    expect(screen.getByText('4.2 kg')).toBeOnTheScreen()
    expect(screen.getByText('No weight yet')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Mango' }))
    expect(router.push).toHaveBeenCalledWith('/pets/p1')
    await user.press(screen.getByRole('button', { name: 'Add a pet' }))
    expect(router.push).toHaveBeenCalledWith('/pets/new')
    jest.useRealTimers()
  })

  it('shows an error with retry', async () => {
    await renderPets(<PetsScreen />, {
      mocks: [{ request: { query: PetListQuery }, error: new Error('offline') }],
    })
    expect(await screen.findByText("Couldn't load your pets")).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen()
  })

  it('shows a loading placeholder first and goes back', async () => {
    const user = userEvent.setup()
    await renderPets(<PetsScreen />, { mocks: [listMock([])] })
    expect(screen.getByTestId('pets-loading', { includeHiddenElements: true })).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Back' }))
    expect(router.back).toHaveBeenCalled()
  })
})
