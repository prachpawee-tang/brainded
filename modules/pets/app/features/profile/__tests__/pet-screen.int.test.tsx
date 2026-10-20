import { toIsoDate } from '@brain/ui'
import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'
import { AddPetNoteMutation, LogPetWeightMutation } from '../../../graphql/pets'
import {
  buildProfile,
  PET_ID,
  profileMock,
  timelineEdge,
  timelineMock,
} from '../../../test/fixtures'
import { renderPets } from '../../../test/render'
import { PetScreen } from '../screens/pet-screen'

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'UGV0OnBldC0x' }),
}))

const TODAY = toIsoDate(new Date())

const timeline = timelineMock(
  [
    timelineEdge('e1', { kind: 'NOTE_VACCINE', occurredOn: '2026-10-05', body: 'Yearly shots' }),
    timelineEdge('e2', { kind: 'WEIGHT', occurredOn: '2026-10-01', weightGrams: 4350 }),
    timelineEdge('e3', { kind: 'NOTE_VET_VISIT', occurredOn: '2026-09-12', body: 'Checkup' }),
  ],
  { hasNextPage: true },
)

const setup = async (mocks: unknown[] = []) => {
  const user = userEvent.setup()
  await renderPets(<PetScreen />, { mocks: [profileMock(), timeline, ...(mocks as never[])] })
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

  it('shows the history grouped by month', async () => {
    await setup()
    expect(await screen.findByText('Yearly shots')).toBeOnTheScreen()
    expect(screen.getByText('Vaccine')).toBeOnTheScreen()
    expect(screen.getByText('Weight 4.35 kg')).toBeOnTheScreen()
    expect(screen.getByText('October 2026')).toBeOnTheScreen()
    expect(screen.getByText('September 2026')).toBeOnTheScreen()
  })

  it('loads older history', async () => {
    const user = await setup([
      timelineMock([timelineEdge('e4', { occurredOn: '2026-08-01', body: 'Older note' })], {
        after: 'c-e3',
      }),
    ])
    await user.press(await screen.findByRole('button', { name: 'Show older' }))
    expect(await screen.findByText('Older note')).toBeOnTheScreen()
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
      timeline,
    ])
    await user.press(screen.getByRole('button', { name: '+ Weight' }))
    await user.type(screen.getByLabelText('Weight (kg)'), '4,5')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(await screen.findByText('Saved ✓')).toBeOnTheScreen()
  })

  it('validates the weight before saving', async () => {
    const user = await setup()
    await user.press(screen.getByRole('button', { name: '+ Weight' }))
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
      timeline,
    ])
    await user.press(screen.getByRole('button', { name: '+ Note' }))
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
    await renderPets(<PetScreen />, { mocks: [profileMock(null), timelineMock([])] })
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
        timelineMock([]),
      ],
    })
    expect(await screen.findByText('Birthday not set')).toBeOnTheScreen()
    expect(screen.getByText('No weight yet')).toBeOnTheScreen()
    expect(screen.getByText('No notes')).toBeOnTheScreen()
    expect(
      await screen.findByText('Nothing logged yet. Start with a weight or a note.'),
    ).toBeOnTheScreen()
  })
})
