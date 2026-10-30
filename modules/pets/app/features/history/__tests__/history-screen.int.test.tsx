import { screen, userEvent } from '@testing-library/react-native'
import { timelineEdge, timelineMock } from '../../../test/fixtures'
import { renderPets } from '../../../test/render'
import { HistoryScreen } from '../screens/history-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'UGV0OnBldC0x' }),
}))

const timeline = timelineMock(
  [
    timelineEdge('e1', { kind: 'NOTE_VACCINE', occurredOn: '2026-10-05', body: 'Yearly shots' }),
    timelineEdge('e2', { kind: 'WEIGHT', occurredOn: '2026-10-01', weightGrams: 4350 }),
    timelineEdge('e3', { kind: 'NOTE_VET_VISIT', occurredOn: '2026-09-12', body: 'Checkup' }),
  ],
  { hasNextPage: true },
)

describe('HistoryScreen', () => {
  it('shows the history grouped by month', async () => {
    await renderPets(<HistoryScreen />, { mocks: [timeline] })
    expect(screen.getByRole('header', { name: 'History' })).toBeOnTheScreen()
    expect(await screen.findByText('Yearly shots')).toBeOnTheScreen()
    expect(screen.getByText('Vaccine')).toBeOnTheScreen()
    expect(screen.getByText('Weight 4.35 kg')).toBeOnTheScreen()
    expect(screen.getByText('October 2026')).toBeOnTheScreen()
    expect(screen.getByText('September 2026')).toBeOnTheScreen()
  })

  it('loads older history', async () => {
    const user = userEvent.setup()
    await renderPets(<HistoryScreen />, {
      mocks: [
        timeline,
        timelineMock([timelineEdge('e4', { occurredOn: '2026-08-01', body: 'Older note' })], {
          after: 'c-e3',
        }),
      ],
    })
    await user.press(await screen.findByRole('button', { name: 'Show older' }))
    expect(await screen.findByText('Older note')).toBeOnTheScreen()
  })
})
