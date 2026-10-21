import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { launchImageLibraryAsync } from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { Alert } from 'react-native'
import { ArchivePetMutation, CreatePetMutation, UpdatePetMutation } from '../../../graphql/pets'
import { buildProfile, PET_ID, profileMock } from '../../../test/fixtures'
import { renderPets } from '../../../test/render'
import { PetEditorScreen } from '../screens/pet-editor-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}))
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }))

const params = useLocalSearchParams as jest.Mock
const pickImage = launchImageLibraryAsync as jest.Mock

const EMPTY = {
  speciesOther: null,
  breed: null,
  sex: 'UNKNOWN',
  birthDate: null,
  notes: null,
  photoKey: null,
}

const createMock = (
  input: Record<string, unknown>,
  data: unknown = {
    createPet: {
      __typename: 'MutationCreatePetSuccess',
      data: { __typename: 'Pet', id: 'new-id' },
    },
  },
) => {
  const result = jest.fn(() => ({ data }))
  return { mock: { request: { query: CreatePetMutation, variables: { input } }, result }, result }
}

describe('PetEditorScreen — create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    params.mockReturnValue({})
  })

  it('creates a pet from name + species and opens its profile', async () => {
    const user = userEvent.setup()
    const { mock, result } = createMock({ name: 'Bo', species: 'DOG', ...EMPTY })
    await renderPets(<PetEditorScreen />, { mocks: [mock] })
    await user.type(screen.getByLabelText('Name'), 'Bo')
    await user.press(screen.getByRole('radio', { name: 'Dog' }))
    await user.press(screen.getByRole('button', { name: 'Add pet' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(router.replace).toHaveBeenCalledWith('/pets/new-id')
  })

  it('preselects the species from the route', async () => {
    params.mockReturnValue({ species: 'CAT' })
    await renderPets(<PetEditorScreen />)
    expect(screen.getByRole('radio', { name: 'Cat' })).toBeChecked()
  })

  it('validates locally, including the other-species name', async () => {
    const user = userEvent.setup()
    await renderPets(<PetEditorScreen />)
    await user.press(screen.getByRole('radio', { name: 'Other' }))
    await user.press(screen.getByRole('button', { name: 'Add pet' }))
    expect(screen.getAllByText('This field is required')).toHaveLength(2)
    expect(screen.getByLabelText('What kind of pet?')).toBeOnTheScreen()
  })

  it('shows server validation issues on fields', async () => {
    const user = userEvent.setup()
    const { mock } = createMock(
      { name: 'Bo', species: 'CAT', ...EMPTY },
      {
        createPet: {
          __typename: 'ValidationError',
          issues: [{ __typename: 'ValidationIssue', path: ['name'], code: 'TOO_LONG' }],
        },
      },
    )
    params.mockReturnValue({ species: 'CAT' })
    await renderPets(<PetEditorScreen />, { mocks: [mock] })
    await user.type(screen.getByLabelText('Name'), 'Bo')
    await user.press(screen.getByRole('button', { name: 'Add pet' }))
    expect(await screen.findByText("That's too long")).toBeOnTheScreen()
  })

  it('uploads a chosen photo and attaches its key', async () => {
    const user = userEvent.setup()
    pickImage.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cat.jpg', mimeType: 'image/jpeg', fileName: 'cat.jpg' }],
    })
    const uploadPhoto = jest.fn(async () => 'u1/uploads/cat.jpg')
    const { mock, result } = createMock({
      name: 'Mango',
      species: 'CAT',
      ...EMPTY,
      photoKey: 'u1/uploads/cat.jpg',
    })
    params.mockReturnValue({ species: 'CAT' })
    await renderPets(<PetEditorScreen />, { mocks: [mock], services: { uploadPhoto } })
    await user.press(screen.getByRole('button', { name: 'Choose photo' }))
    await waitFor(() =>
      expect(uploadPhoto).toHaveBeenCalledWith({
        uri: 'file:///cat.jpg',
        mimeType: 'image/jpeg',
        fileName: 'cat.jpg',
      }),
    )
    await user.type(screen.getByLabelText('Name'), 'Mango')
    await user.press(screen.getByRole('button', { name: 'Add pet' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('reports a failed upload', async () => {
    const user = userEvent.setup()
    pickImage.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cat.jpg', mimeType: 'image/jpeg', fileName: 'cat.jpg' }],
    })
    await renderPets(<PetEditorScreen />, {
      services: { uploadPhoto: jest.fn(async () => Promise.reject(new Error('x'))) },
    })
    await user.press(screen.getByRole('button', { name: 'Choose photo' }))
    expect(await screen.findByText("Couldn't upload the photo")).toBeOnTheScreen()
  })
})

describe('PetEditorScreen — edit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    params.mockReturnValue({ id: PET_ID })
  })

  it('prefills, saves changes and goes back', async () => {
    const user = userEvent.setup()
    const result = jest.fn(() => ({
      data: {
        updatePet: {
          __typename: 'MutationUpdatePetSuccess',
          data: {
            ...buildProfile({ name: 'Mango Jr' }),
            latestWeight: undefined,
            previousWeight: undefined,
          },
        },
      },
    }))
    const input = {
      id: PET_ID,
      name: 'Mango Jr',
      species: 'CAT',
      speciesOther: null,
      breed: 'Thai',
      sex: 'FEMALE',
      birthDate: '2024-07-20',
      notes: 'Allergic to chicken',
      photoKey: undefined,
    }
    const { photoKey: _ignored, ...withoutPhoto } = input
    await renderPets(<PetEditorScreen />, {
      mocks: [
        profileMock(),
        { request: { query: UpdatePetMutation, variables: { input: withoutPhoto } }, result },
      ],
    })
    const name = await screen.findByDisplayValue('Mango')
    await user.clear(name)
    await user.type(name, 'Mango Jr')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(router.back).toHaveBeenCalled()
  })

  it('archives after confirmation', async () => {
    const user = userEvent.setup()
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.[1]?.onPress?.())
    const result = jest.fn(() => ({
      data: { archivePet: { __typename: 'MutationArchivePetSuccess' } },
    }))
    await renderPets(<PetEditorScreen />, {
      mocks: [
        profileMock(),
        { request: { query: ArchivePetMutation, variables: { input: { id: PET_ID } } }, result },
      ],
    })
    await user.press(await screen.findByRole('button', { name: 'Archive this pet' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(router.replace).toHaveBeenCalledWith('/pets')
  })
})
