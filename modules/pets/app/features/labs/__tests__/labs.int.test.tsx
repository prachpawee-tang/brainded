import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { launchImageLibraryAsync } from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { Alert } from 'react-native'
import {
  AddPetLabResultMutation,
  DeletePetLabResultMutation,
  PetLabResultQuery,
} from '../../../graphql/health'
import { PET_ID } from '../../../test/fixtures'
import { labsMock, TODAY } from '../../../test/health-fixtures'
import { renderPets } from '../../../test/render'
import { LabResultsSection } from '../components/lab-results-section'
import { LabResultEditorScreen } from '../screens/lab-result-editor-screen'
import { LabResultScreen } from '../screens/lab-result-screen'
import { LabResultsScreen } from '../screens/lab-results-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}))
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }))

const params = useLocalSearchParams as jest.Mock
const LABS = [
  { id: 'l1', title: 'Blood test', takenOn: '2026-10-01', abnormalCount: 2 },
  { id: 'l2', title: 'Urine test', takenOn: '2026-09-01', abnormalCount: 0 },
]

const detailMock = {
  request: { query: PetLabResultQuery, variables: { id: PET_ID, labId: 'l1' } },
  result: {
    data: {
      pet: {
        __typename: 'Pet',
        id: PET_ID,
        name: 'Mango',
        labResult: {
          __typename: 'PetLabResult',
          id: 'l1',
          takenOn: '2026-10-01',
          title: 'Blood test',
          clinic: 'Happy Paws',
          note: 'Recheck in a month',
          abnormalCount: 2,
          values: [
            {
              __typename: 'PetLabValue',
              id: 'v1',
              name: 'ALT',
              value: 120,
              unit: 'U/L',
              refLow: 10,
              refHigh: 100,
              flag: 'HIGH',
            },
            {
              __typename: 'PetLabValue',
              id: 'v2',
              name: 'HCT',
              value: 30,
              unit: '%',
              refLow: 37,
              refHigh: null,
              flag: 'LOW',
            },
            {
              __typename: 'PetLabValue',
              id: 'v3',
              name: 'BUN',
              value: 20,
              unit: 'mg/dL',
              refLow: 7,
              refHigh: 27,
              flag: 'NORMAL',
            },
            {
              __typename: 'PetLabValue',
              id: 'v4',
              name: 'Other',
              value: 1,
              unit: null,
              refLow: null,
              refHigh: 5,
              flag: 'NORMAL',
            },
          ],
          photos: [{ __typename: 'PetAttachment', id: 'p1', url: 'https://img.test/r.jpg' }],
        },
      },
    },
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  params.mockReturnValue({ id: PET_ID, labId: 'l1' })
})

describe('LabResultsSection', () => {
  it('shows the latest results with their status and links', async () => {
    const user = userEvent.setup()
    await renderPets(<LabResultsSection petId={PET_ID} />, { mocks: [labsMock(LABS, 2)] })
    expect(await screen.findByText('2 outside range')).toBeOnTheScreen()
    expect(screen.getByText('All in range')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Blood test' }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/labs/l1`)
    await user.press(screen.getByRole('button', { name: '+ Add results' }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/labs/new`)
    await user.press(screen.getByRole('button', { name: 'See all' }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/labs`)
  })

  it('invites adding the first result', async () => {
    await renderPets(<LabResultsSection petId={PET_ID} />, { mocks: [labsMock([], 2)] })
    expect(await screen.findByText('No results yet. Add them after a vet visit.')).toBeOnTheScreen()
  })
})

describe('LabResultsScreen', () => {
  it('lists every result', async () => {
    await renderPets(<LabResultsScreen />, { mocks: [labsMock(LABS)] })
    expect(await screen.findByRole('button', { name: 'Urine test' })).toBeOnTheScreen()
  })
})

describe('LabResultScreen', () => {
  it('shows values with flags as text, ranges, photos and notes', async () => {
    await renderPets(<LabResultScreen />, { mocks: [detailMock] })
    expect(await screen.findByRole('header', { name: 'Blood test' })).toBeOnTheScreen()
    expect(screen.getByText('↑ High')).toBeOnTheScreen()
    expect(screen.getByText('↓ Low')).toBeOnTheScreen()
    expect(screen.getAllByText('Normal')).toHaveLength(2)
    expect(screen.getByText('Normal 10–100')).toBeOnTheScreen()
    expect(screen.getByText('Normal ≥ 37')).toBeOnTheScreen()
    expect(screen.getByText('Normal ≤ 5')).toBeOnTheScreen()
    expect(screen.getByText('120 U/L')).toBeOnTheScreen()
    expect(screen.getByLabelText('Report photo 1')).toBeOnTheScreen()
    expect(screen.getByText('Recheck in a month')).toBeOnTheScreen()
  })

  it('deletes after confirmation', async () => {
    const user = userEvent.setup()
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.[1]?.onPress?.())
    const result = jest.fn(() => ({
      data: { deletePetLabResult: { __typename: 'MutationDeletePetLabResultSuccess' } },
    }))
    await renderPets(<LabResultScreen />, {
      mocks: [
        detailMock,
        {
          request: { query: DeletePetLabResultMutation, variables: { input: { id: 'l1' } } },
          result,
        },
      ],
    })
    await user.press(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(router.back).toHaveBeenCalled()
  })

  it('handles a missing result', async () => {
    await renderPets(<LabResultScreen />, {
      mocks: [
        {
          ...detailMock,
          result: { data: { pet: { ...detailMock.result.data.pet, labResult: null } } },
        },
      ],
    })
    expect(await screen.findByText('This result no longer exists')).toBeOnTheScreen()
  })
})

describe('LabResultEditorScreen', () => {
  it('builds a result from a preset, a custom value and a photo', async () => {
    const user = userEvent.setup()
    ;(launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///r.jpg', mimeType: 'image/jpeg', fileName: 'r.jpg' }],
    })
    const uploadPhoto = jest.fn(async () => 'u1/uploads/r.jpg')
    const input = {
      petId: PET_ID,
      takenOn: TODAY,
      title: 'Blood test',
      clinic: null,
      note: null,
      values: [
        { name: 'ALT', value: 120, unit: 'U/L', refLow: 10, refHigh: 100 },
        { name: 'Ketone', value: 0.5, unit: null, refLow: null, refHigh: null },
      ],
      photoKeys: ['u1/uploads/r.jpg'],
    }
    const result = jest.fn(() => ({
      data: {
        addPetLabResult: {
          __typename: 'MutationAddPetLabResultSuccess',
          data: { __typename: 'PetLabResult', id: 'new-lab' },
        },
      },
    }))
    await renderPets(<LabResultEditorScreen />, {
      mocks: [{ request: { query: AddPetLabResultMutation, variables: { input } }, result }],
      services: { uploadPhoto },
    })
    await user.type(screen.getByLabelText('Title (e.g. Blood test)'), 'Blood test')
    await user.press(screen.getByRole('button', { name: 'ALT' }))
    await user.type(screen.getByLabelText('Result 1'), '120')
    await user.type(screen.getByLabelText('Normal from 1'), '10')
    await user.type(screen.getByLabelText('to 1'), '100')
    await user.press(screen.getByRole('button', { name: '+ Add a value' }))
    await user.type(screen.getByLabelText('Test 2'), 'Ketone')
    await user.type(screen.getByLabelText('Result 2'), '0,5')
    await user.press(screen.getByRole('button', { name: '+ Add photo' }))
    await waitFor(() => expect(uploadPhoto).toHaveBeenCalled())
    await user.press(screen.getByRole('button', { name: 'Save results' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(router.replace).toHaveBeenCalledWith(`/pets/${PET_ID}/labs/new-lab`)
  })

  it('validates before saving and lets rows be removed', async () => {
    const user = userEvent.setup()
    await renderPets(<LabResultEditorScreen />)
    await user.press(screen.getByRole('button', { name: 'Save results' }))
    expect(screen.getByText('This field is required')).toBeOnTheScreen()
    expect(screen.getByText('Add at least one value or photo')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: '+ Add a value' }))
    await user.type(screen.getByLabelText('Result 1'), 'abc')
    await user.press(screen.getByRole('button', { name: 'Save results' }))
    expect(screen.getByText('Please pick a valid option')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Remove 1' }))
    expect(screen.queryByLabelText('Result 1')).not.toBeOnTheScreen()
  })
})
