import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { launchImageLibraryAsync } from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { Alert } from 'react-native'
import {
  AddPetLabResultMutation,
  DeletePetLabResultMutation,
  PetLabResultQuery,
  PetLabTrendQuery,
  UpdatePetLabResultMutation,
} from '../../../graphql/health'
import { PET_ID } from '../../../test/fixtures'
import { labsMock, TODAY } from '../../../test/health-fixtures'
import { renderPets } from '../../../test/render'
import { LabResultEditorScreen } from '../screens/lab-result-editor-screen'
import { LabResultScreen } from '../screens/lab-result-screen'
import { LabResultsScreen } from '../screens/lab-results-screen'
import { LabTrendScreen } from '../screens/lab-trend-screen'

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
          remark: 'Mild hemolysis',
          interpretation: 'Liver a bit high, recheck',
          abnormalCount: 3,
          values: [
            {
              __typename: 'PetLabValue',
              id: 'v1',
              section: 'CHEMISTRY',
              code: 'ALT',
              textValue: null,
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
              section: 'CBC',
              code: 'HCT',
              textValue: null,
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
              section: 'CHEMISTRY',
              code: 'BUN',
              textValue: null,
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
              section: 'OTHER',
              code: 'OTHER',
              textValue: null,
              name: 'Other',
              value: 1,
              unit: null,
              refLow: null,
              refHigh: 5,
              flag: 'NORMAL',
            },
            {
              __typename: 'PetLabValue',
              id: 'v5',
              section: 'PARASITE',
              code: 'BLOOD_PARASITE',
              name: 'Blood parasites',
              value: null,
              textValue: 'Positive',
              unit: null,
              refLow: null,
              refHigh: null,
              flag: 'ABNORMAL',
            },
          ],
          photos: [
            {
              __typename: 'PetAttachment',
              id: 'p1',
              key: 'u1/uploads/r.jpg',
              url: 'https://img.test/r.jpg',
            },
          ],
        },
      },
    },
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  params.mockReturnValue({ id: PET_ID, labId: 'l1' })
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

  it('groups values by report section and shows text answers, remark and interpretation', async () => {
    await renderPets(<LabResultScreen />, { mocks: [detailMock] })
    await screen.findByRole('header', { name: 'Blood test' })
    const sections = ['Blood count (CBC)', 'Blood parasites', 'Blood chemistry', 'Other']
    const positions = sections.map((name) => JSON.stringify(screen.toJSON()).indexOf(`"${name}"`))
    expect(positions.every((pos, i) => pos > 0 && (i === 0 || pos > (positions[i - 1] ?? 0)))).toBe(
      true,
    )
    expect(screen.getByText('Positive')).toBeOnTheScreen()
    expect(screen.getByText('! Abnormal')).toBeOnTheScreen()
    expect(screen.getByText('What the vet said')).toBeOnTheScreen()
    expect(screen.getByText('Liver a bit high, recheck')).toBeOnTheScreen()
    expect(screen.getByText('Mild hemolysis')).toBeOnTheScreen()
  })

  it('opens a test over time and the editor', async () => {
    const user = userEvent.setup()
    await renderPets(<LabResultScreen />, { mocks: [detailMock] })
    await user.press(await screen.findByRole('button', { name: /^ALT 120 U\/L/ }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/labs/tests/ALT`)
    await user.press(screen.getByRole('button', { name: 'Edit' }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/labs/l1/edit`)
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
  beforeEach(() => params.mockReturnValue({ id: PET_ID }))

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
      remark: null,
      interpretation: 'All fine',
      values: [
        {
          section: 'CHEMISTRY',
          code: 'ALT',
          name: 'ALT',
          value: 120,
          textValue: null,
          unit: 'U/L',
          refLow: 10,
          refHigh: 100,
        },
        {
          section: 'OTHER',
          code: null,
          name: 'Ketone',
          value: 0.5,
          textValue: null,
          unit: null,
          refLow: null,
          refHigh: null,
        },
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
    await user.type(await screen.findByLabelText('Result 1'), '120')
    await user.type(screen.getByLabelText('Normal from 1'), '10')
    await user.type(screen.getByLabelText('to 1'), '100')
    await user.press(screen.getByRole('button', { name: 'Add a test' }))
    await user.type(screen.getByLabelText('Search, e.g. ค่าไต or CREA'), 'Ketone')
    await user.press(screen.getByRole('button', { name: 'Add “Ketone”' }))
    await user.type(screen.getByLabelText('Result 2'), '0,5')
    await user.type(screen.getByLabelText('What the vet said (optional)'), 'All fine')
    await user.press(screen.getByRole('button', { name: 'Add photo' }))
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
    await user.press(screen.getByRole('button', { name: 'Add a test' }))
    await user.type(screen.getByLabelText('Search, e.g. ค่าไต or CREA'), 'Mystery')
    await user.press(screen.getByRole('button', { name: 'Add “Mystery”' }))
    await user.press(screen.getByRole('button', { name: 'Save results' }))
    expect(await screen.findAllByText('This field is required')).toHaveLength(2)
    await user.press(screen.getByRole('button', { name: 'Remove 1' }))
    expect(screen.queryByLabelText('Result 1')).not.toBeOnTheScreen()
  })
})

describe('LabResultEditorScreen v2', () => {
  it('finds a test by its Thai name, prefills from the last result and saves a text answer', async () => {
    const user = userEvent.setup()
    params.mockReturnValue({ id: PET_ID })
    const trend = (code: string, points: object[]) => ({
      request: { query: PetLabTrendQuery, variables: { id: PET_ID, code } },
      result: { data: { pet: { __typename: 'Pet', id: PET_ID, labTrend: points } } },
    })
    const lastCrea = {
      __typename: 'PetLabTrendPoint',
      id: 'x',
      takenOn: '2026-06-01',
      labResultId: 'old',
      name: 'CREA',
      value: 1.1,
      textValue: null,
      unit: 'mg/dL',
      refLow: 0.8,
      refHigh: 1.8,
      flag: 'NORMAL',
    }
    const input = {
      petId: PET_ID,
      takenOn: TODAY,
      title: 'Kidney check',
      clinic: null,
      note: null,
      remark: null,
      interpretation: null,
      values: [
        {
          section: 'CHEMISTRY',
          code: 'CREA',
          name: 'CREA',
          value: 1.4,
          textValue: null,
          unit: 'mg/dL',
          refLow: 0.8,
          refHigh: 1.8,
        },
        {
          section: 'PARASITE',
          code: 'BLOOD_PARASITE',
          name: 'Blood parasites',
          value: null,
          textValue: 'Not Found',
          unit: null,
          refLow: null,
          refHigh: null,
        },
      ],
      photoKeys: [],
    }
    const result = jest.fn(() => ({
      data: {
        addPetLabResult: {
          __typename: 'MutationAddPetLabResultSuccess',
          data: { __typename: 'PetLabResult', id: 'n' },
        },
      },
    }))
    await renderPets(<LabResultEditorScreen />, {
      mocks: [
        trend('CREA', [lastCrea]),
        trend('BLOOD_PARASITE', []),
        { request: { query: AddPetLabResultMutation, variables: { input } }, result },
      ],
    })
    await user.type(screen.getByLabelText('Title (e.g. Blood test)'), 'Kidney check')
    await user.press(screen.getByRole('button', { name: 'Add a test' }))
    await user.type(screen.getByLabelText('Search, e.g. ค่าไต or CREA'), 'ค่าไต')
    expect(screen.queryByRole('button', { name: 'Add “ค่าไต”' })).not.toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'CREA Creatinine' }))
    expect(await screen.findByDisplayValue('0.8')).toBeOnTheScreen()
    expect(screen.getByDisplayValue('1.8')).toBeOnTheScreen()
    await user.type(screen.getByLabelText('Result 1'), '1.4')
    await user.press(screen.getByRole('button', { name: 'Add a test' }))
    await user.type(screen.getByLabelText('Search, e.g. ค่าไต or CREA'), 'พยาธิ')
    await user.press(screen.getByRole('button', { name: 'Blood parasites' }))
    // Parasites come before chemistry on the report, so the new row is first on screen.
    await screen.findByLabelText('Result 2')
    await user.type(screen.getByLabelText('Result 1'), 'Not Found')
    expect(screen.getByText('Blood parasites', { exact: false })).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Save results' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('edits an existing result and keeps its photos', async () => {
    const user = userEvent.setup()
    const update = jest.fn(() => ({
      data: {
        updatePetLabResult: {
          __typename: 'MutationUpdatePetLabResultSuccess',
          data: { __typename: 'PetLabResult', id: 'l1' },
        },
      },
    }))
    await renderPets(<LabResultEditorScreen />, {
      mocks: [
        detailMock,
        {
          request: {
            query: UpdatePetLabResultMutation,
            variables: (vars: {
              input: { id: string; title: string; photoKeys: string[]; values: unknown[] }
            }) =>
              vars.input.id === 'l1' &&
              vars.input.title === 'Blood test (redo)' &&
              vars.input.photoKeys.join() === 'u1/uploads/r.jpg' &&
              vars.input.values.length === 5,
          },
          result: update,
        },
      ],
    })
    expect(await screen.findByText('Edit vet results')).toBeOnTheScreen()
    expect(screen.getByDisplayValue('Positive')).toBeOnTheScreen()
    const title = screen.getByDisplayValue('Blood test')
    await user.clear(title)
    await user.type(title, 'Blood test (redo)')
    await user.press(screen.getByRole('button', { name: 'Save results' }))
    await waitFor(() => expect(update).toHaveBeenCalled())
    expect(router.replace).toHaveBeenCalledWith(`/pets/${PET_ID}/labs/l1`)
  })
})

describe('LabTrendScreen', () => {
  it('charts one test on a common unit and lists every result', async () => {
    params.mockReturnValue({ id: PET_ID, code: 'WBC' })
    const point = (
      id: string,
      takenOn: string,
      value: number | null,
      unit: string | null,
      extra = {},
    ) => ({
      __typename: 'PetLabTrendPoint',
      id,
      takenOn,
      labResultId: `r-${id}`,
      name: 'WBC',
      value,
      textValue: null,
      unit,
      refLow: 5.5,
      refHigh: 19.5,
      flag: 'NORMAL',
      ...extra,
    })
    const user = userEvent.setup()
    await renderPets(<LabTrendScreen />, {
      mocks: [
        {
          request: { query: PetLabTrendQuery, variables: { id: PET_ID, code: 'WBC' } },
          result: {
            data: {
              pet: {
                __typename: 'Pet',
                id: PET_ID,
                labTrend: [
                  point('1', '2026-06-01', 12200, 'cells/µL'),
                  point('2', '2026-08-01', 60, '%'),
                  point('3', '2026-10-01', 9.5, '×10³/µL'),
                ],
              },
            },
          },
        },
      ],
    })
    expect(await screen.findByRole('header', { name: 'WBC · White blood cells' })).toBeOnTheScreen()
    expect(await screen.findByText('Latest range: Normal 5.5–19.5')).toBeOnTheScreen()
    expect(screen.getByText(/^Not on the chart/)).toBeOnTheScreen()
    expect(screen.getByText('12,200 cells/µL')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: '9.5 ×10³/µL' }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/labs/r-3`)
  })
})
