import { toIsoDate } from '@brain/ui'
import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'
import { AddPetNoteMutation, LogPetWeightMutation } from '../../../graphql/pets'
import { buildProfile, PET_ID, profileMock } from '../../../test/fixtures'
import { renderPets } from '../../../test/render'
import { PetScreen } from '../screens/pet-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'UGV0OnBldC0x' }),
}))

const TODAY = toIsoDate(new Date())

const setup = async (mocks: unknown[] = []) => {
  const user = userEvent.setup()
  await renderPets(<PetScreen />, { mocks: [profileMock(), ...(mocks as never[])] })
  await screen.findByRole('header', { name: 'Mango' })
  return user
}

describe('PetScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows the key facts for the vet', async () => {
    await setup()
    expect(screen.getByText('Cat · Thai · Female')).toBeOnTheScreen()
    expect(screen.getByText(/^Born /)).toBeOnTheScreen()
    expect(screen.getByText('4.35 kg')).toBeOnTheScreen()
    expect(screen.getByText('+0.15 kg')).toBeOnTheScreen()
    expect(screen.getByText('Allergic to chicken')).toBeOnTheScreen()
  })

  it('keeps the first screen to essentials and links to the details', async () => {
    await setup()
    expect(screen.getByText('Details')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: /^History/ })).toBeOnTheScreen()
    expect(screen.queryByText('Yearly shots')).not.toBeOnTheScreen()
  })

  it('logs a weight from the quick-log sheet', async () => {
    const result = jest.fn(() => ({
      data: {
        logPetWeight: {
          __typename: 'MutationLogPetWeightSuccess',
          data: {
            __typename: 'Pet',
            id: PET_ID,
            latestWeight: {
              __typename: 'PetWeight',
              id: 'w3',
              weightGrams: 4500,
              measuredOn: TODAY,
            },
            previousWeight: {
              __typename: 'PetWeight',
              id: 'w2',
              weightGrams: 4350,
              measuredOn: '2026-10-01',
            },
          },
        },
      },
    }))
    const user = await setup([
      {
        request: {
          query: LogPetWeightMutation,
          variables: { input: { petId: PET_ID, weightKg: 4.5, measuredOn: TODAY, note: null } },
        },
        result,
      },
    ])
    await user.press(screen.getByRole('button', { name: 'Log weight' }))
    await user.type(screen.getByLabelText('Weight (kg)'), '4,5')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(await screen.findByText('Saved ✓')).toBeOnTheScreen()
  })

  it('validates the weight before saving', async () => {
    const user = await setup()
    await user.press(screen.getByRole('button', { name: 'Log weight' }))
    await user.type(screen.getByLabelText('Weight (kg)'), '0')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText("That's below 0.1 kg")).toBeOnTheScreen()
  })

  it('adds a typed note', async () => {
    const result = jest.fn(() => ({
      data: { addPetNote: { __typename: 'MutationAddPetNoteSuccess' } },
    }))
    const user = await setup([
      {
        request: {
          query: AddPetNoteMutation,
          variables: {
            input: { petId: PET_ID, type: 'VACCINE', body: 'Rabies', occurredOn: TODAY },
          },
        },
        result,
      },
    ])
    await user.press(screen.getByRole('button', { name: 'Add a note' }))
    await user.press(screen.getByRole('radio', { name: 'Vaccine' }))
    await user.type(screen.getByLabelText('What happened?'), 'Rabies')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('opens the editor', async () => {
    const user = await setup()
    await user.press(screen.getByRole('button', { name: 'Edit' }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/edit`)
  })

  it('handles a missing pet', async () => {
    await renderPets(<PetScreen />, { mocks: [profileMock(null)] })
    expect(await screen.findByText("We couldn't find this pet")).toBeOnTheScreen()
  })

  it('handles a pet without birthday, weight or notes', async () => {
    await renderPets(<PetScreen />, {
      mocks: [
        profileMock(
          buildProfile({
            birthDate: null,
            latestWeight: null,
            previousWeight: null,
            notes: null,
            breed: null,
          }),
        ),
      ],
    })
    expect(await screen.findByText('Birthday not set')).toBeOnTheScreen()
    expect(screen.getByText('No weight yet')).toBeOnTheScreen()
    expect(screen.getByText('No notes')).toBeOnTheScreen()
  })
})
