import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { AddPetMedicationMutation, UpdatePetMedicationMutation } from '../../../graphql/health'
import { PET_ID } from '../../../test/fixtures'
import { medicationsMock, TODAY } from '../../../test/health-fixtures'
import { renderPets } from '../../../test/render'
import { MedicationSheet } from '../components/medication-sheet'
import { MedicationsScreen } from '../screens/medications-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'UGV0OnBldC0x' }),
}))

const MEDS = [
  { id: 'm1', name: 'Apoquel', dosage: '½ tablet', times: ['08:00', '20:00'] },
  { id: 'm2', name: 'Heartgard', times: ['09:00'], everyDays: 30 },
  { id: 'm3', name: 'Antibiotic', times: ['08:00'], startOn: '2026-01-01', endOn: '2026-01-10' },
]

const addResult = () =>
  jest.fn(() => ({
    data: {
      addPetMedication: {
        __typename: 'MutationAddPetMedicationSuccess',
        data: { __typename: 'PetMedication', id: 'new' },
      },
    },
  }))

describe('MedicationSheet', () => {
  beforeEach(() => jest.clearAllMocks())

  it('adds a medication from preset and custom times', async () => {
    const user = userEvent.setup()
    const result = addResult()
    const onClose = jest.fn()
    const input = {
      petId: PET_ID,
      name: 'Apoquel',
      dosage: '½ tablet',
      times: ['08:00', '14:30', '21:00'],
      everyDays: 7,
      startOn: TODAY,
      endOn: null,
      note: null,
    }
    await renderPets(<MedicationSheet petId={PET_ID} visible onClose={onClose} />, {
      mocks: [{ request: { query: AddPetMedicationMutation, variables: { input } }, result }],
    })
    await user.type(screen.getByLabelText('Medicine'), 'Apoquel')
    await user.type(screen.getByLabelText('Dose (e.g. ½ tablet)'), '½ tablet')
    await user.press(screen.getByRole('checkbox', { name: 'Bedtime 21:00' }))
    await user.press(screen.getByRole('checkbox', { name: 'Morning 08:00' }))
    await user.type(screen.getByLabelText('Other time (HH:MM)'), '14:30')
    await user.press(screen.getByRole('button', { name: 'Add' }))
    await user.press(screen.getByRole('radio', { name: 'Weekly' }))
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  it('validates times', async () => {
    const user = userEvent.setup()
    await renderPets(<MedicationSheet petId={PET_ID} visible onClose={jest.fn()} />)
    await user.type(screen.getByLabelText('Medicine'), 'Apoquel')
    await user.type(screen.getByLabelText('Other time (HH:MM)'), '8am')
    await user.press(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Use HH:MM, e.g. 08:00')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('This field is required')).toBeOnTheScreen()
  })

  it('removes a custom time chip', async () => {
    const user = userEvent.setup()
    await renderPets(<MedicationSheet petId={PET_ID} visible onClose={jest.fn()} />)
    await user.type(screen.getByLabelText('Other time (HH:MM)'), '14:30')
    await user.press(screen.getByRole('button', { name: 'Add' }))
    await user.press(screen.getByRole('button', { name: 'Remove 14:30' }))
    expect(screen.queryByRole('button', { name: 'Remove 14:30' })).not.toBeOnTheScreen()
  })

  it('updates an existing medication', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const medication = {
      __typename: 'PetMedication' as const,
      id: 'm2',
      name: 'Heartgard',
      dosage: null,
      times: ['09:00'],
      everyDays: 30,
      startOn: '2026-10-01',
      endOn: null,
      note: null,
    }
    const input = {
      id: 'm2',
      name: 'Heartgard Plus',
      dosage: null,
      times: ['09:00'],
      everyDays: 30,
      startOn: '2026-10-01',
      endOn: null,
      note: null,
    }
    const result = jest.fn(() => ({
      data: {
        updatePetMedication: {
          __typename: 'MutationUpdatePetMedicationSuccess',
          data: { ...medication, name: 'Heartgard Plus' },
        },
      },
    }))
    await renderPets(
      <MedicationSheet petId={PET_ID} medication={medication} visible onClose={onClose} />,
      {
        mocks: [{ request: { query: UpdatePetMedicationMutation, variables: { input } }, result }],
      },
    )
    expect(screen.getByRole('radio', { name: 'Every 30 days' })).toBeChecked()
    const name = screen.getByDisplayValue('Heartgard')
    await user.clear(name)
    await user.type(name, 'Heartgard Plus')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })
})

describe('MedicationsScreen', () => {
  it('splits current and ended medications', async () => {
    const user = userEvent.setup()
    await renderPets(<MedicationsScreen />, { mocks: [medicationsMock(MEDS)] })
    expect(await screen.findByText('Ended')).toBeOnTheScreen()
    expect(screen.getByText('Antibiotic')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Add medication' }))
    expect(screen.getByRole('header', { name: 'New medication' })).toBeOnTheScreen()
  })
})
