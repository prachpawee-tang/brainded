import { screen, userEvent } from '@testing-library/react-native'
import { router } from 'expo-router'
import { PET_ID } from '../../../test/fixtures'
import {
  appointmentsMock,
  daysFromToday,
  inDays,
  labsMock,
  medicationsMock,
  weightsMock,
} from '../../../test/health-fixtures'
import { renderPets } from '../../../test/render'
import { tasksMock } from '../../../test/task-fixtures'
import { DetailLinks } from '../components/detail-links'

jest.mock('expo-router', () => ({ router: { canGoBack: () => true, push: jest.fn() } }))

const filled = [
  weightsMock(null, [
    [4200, '2026-09-01'],
    [4350, '2026-10-01'],
  ]),
  labsMock([{ id: 'l1', title: 'Blood test', takenOn: '2026-10-10', abnormalCount: 2 }], 1),
  medicationsMock([
    { id: 'm1', name: 'Pill A', times: ['08:00'] },
    { id: 'm2', name: 'Old pill', times: ['08:00'], endOn: daysFromToday(-30) },
  ]),
  appointmentsMock([{ id: 'a1', reason: 'Vaccines', scheduledAt: inDays(3) }]),
  tasksMock([{ id: 't1', title: 'Buy food' }]),
]

const empty = [
  weightsMock(null, []),
  labsMock([], 1),
  medicationsMock([]),
  appointmentsMock([]),
  tasksMock([]),
]

describe('DetailLinks', () => {
  beforeEach(() => jest.clearAllMocks())

  it('summarises each detail page in one line', async () => {
    await renderPets(<DetailLinks petId={PET_ID} />, { mocks: filled })
    expect(await screen.findByText('2 entries')).toBeOnTheScreen()
    expect(await screen.findByText(/^Blood test · /)).toBeOnTheScreen()
    expect(screen.getByText('2 outside range')).toBeOnTheScreen()
    expect(await screen.findByText('1 active')).toBeOnTheScreen()
    expect(await screen.findByText(/^Next: /)).toBeOnTheScreen()
    expect(await screen.findByText('1 open')).toBeOnTheScreen()
  })

  it('opens each detail page', async () => {
    const user = userEvent.setup()
    await renderPets(<DetailLinks petId={PET_ID} />, { mocks: empty })
    const pages = [
      ['Weight', 'weights'],
      ['Vet results', 'labs'],
      ['Medications', 'medications'],
      ['Appointments', 'appointments'],
      ['To-dos', 'tasks'],
      ['History', 'history'],
    ]
    for (const [name, path] of pages) {
      await user.press(await screen.findByRole('button', { name: new RegExp(`^${name}`) }))
      expect(router.push).toHaveBeenLastCalledWith(`/pets/${PET_ID}/${path}`)
    }
  })

  it('says when a page has nothing yet', async () => {
    await renderPets(<DetailLinks petId={PET_ID} />, { mocks: empty })
    expect(await screen.findByText('No weight yet')).toBeOnTheScreen()
    expect(await screen.findByText('Nothing to do')).toBeOnTheScreen()
  })
})
