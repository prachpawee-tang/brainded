import { screen, userEvent } from '@testing-library/react-native'
import { router } from 'expo-router'
import { rangeSince } from '../../../lib/format'
import { PET_ID } from '../../../test/fixtures'
import { weightsMock } from '../../../test/health-fixtures'
import { renderPets } from '../../../test/render'
import { WeightTrendCard } from '../components/weight-trend-card'
import { WeightsScreen } from '../screens/weights-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'UGV0OnBldC0x' }),
}))

const SIX_MONTHS = rangeSince('6M')
const WEIGHTS: [number, string][] = [
  [4000, '2026-06-01'],
  [4400, '2026-08-01'],
  [4300, '2026-10-01'],
]

describe('WeightTrendCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it('charts the last 6 months with average, lowest, highest and change', async () => {
    await renderPets(<WeightTrendCard petId={PET_ID} />, {
      mocks: [weightsMock(SIX_MONTHS, WEIGHTS)],
    })
    expect(await screen.findByText('4.23 kg')).toBeOnTheScreen()
    expect(screen.getByText('4 kg')).toBeOnTheScreen()
    expect(screen.getByText('4.4 kg')).toBeOnTheScreen()
    expect(screen.getByText('+0.3 kg')).toBeOnTheScreen()
    expect(screen.getByLabelText(/^Weight from 4 to 4\.3 kg/)).toBeOnTheScreen()
    expect(screen.getByText('Average 4.23 kg')).toBeOnTheScreen()
  })

  it('switches range', async () => {
    const user = userEvent.setup()
    await renderPets(<WeightTrendCard petId={PET_ID} />, {
      mocks: [
        weightsMock(SIX_MONTHS, WEIGHTS),
        weightsMock(null, [[3000, '2025-01-01'], ...WEIGHTS]),
      ],
    })
    await screen.findByText('4.23 kg')
    await user.press(screen.getByRole('radio', { name: 'All' }))
    expect(await screen.findByText('3 kg')).toBeOnTheScreen()
    expect(screen.getByText('+1.3 kg')).toBeOnTheScreen()
  })

  it('asks for more data with fewer than two weights and links to the full log', async () => {
    const user = userEvent.setup()
    await renderPets(<WeightTrendCard petId={PET_ID} />, {
      mocks: [weightsMock(SIX_MONTHS, [[4000, '2026-10-01']])],
    })
    expect(await screen.findByText('Log two weights to see the trend')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'All weights' }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/weights`)
  })
})

describe('WeightsScreen', () => {
  it('lists every weight, newest first', async () => {
    await renderPets(<WeightsScreen />, { mocks: [weightsMock(null, WEIGHTS)] })
    const rows = await screen.findAllByText(/kg$/)
    expect(rows.map((r) => r.props.children)).toEqual(['4.3 kg', '4.4 kg', '4 kg'])
  })
})
