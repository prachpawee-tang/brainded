import { fireEvent, render, screen } from '@testing-library/react-native'
import { LineChart, nearestIndex } from './line-chart'

const POINTS = [
  { key: 'a', x: 0, y: 4000 },
  { key: 'b', x: 10, y: 4400 },
  { key: 'c', x: 20, y: 4300 },
]

const props = {
  points: POINTS,
  color: '#c96a22',
  average: 4233,
  averageLabel: 'avg',
  formatY: (y: number) => `${y / 1000} kg`,
  formatX: (x: number) => `day ${x}`,
  accessibilityLabel: 'Weight from 4 kg to 4.3 kg',
}

describe('nearestIndex', () => {
  it('finds the closest point by x', () => {
    expect(nearestIndex([0, 10, 20], 4)).toBe(0)
    expect(nearestIndex([0, 10, 20], 6)).toBe(1)
    expect(nearestIndex([0, 10, 20], 99)).toBe(2)
  })
})

describe('LineChart', () => {
  it('summarises the series for screen readers and shows the latest value', async () => {
    await render(<LineChart {...props} />)
    expect(screen.getByLabelText('Weight from 4 kg to 4.3 kg')).toBeOnTheScreen()
    expect(screen.getByText('4.3 kg')).toBeOnTheScreen()
    expect(screen.getByText('day 20')).toBeOnTheScreen()
  })

  it('reads out the nearest point while scrubbing and resets after', async () => {
    await render(<LineChart {...props} />)
    const surface = screen.getByTestId('line-chart-surface')
    await fireEvent(surface, 'layout', { nativeEvent: { layout: { width: 300, height: 180 } } })
    await fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 150 } })
    expect(screen.getByText('4.4 kg')).toBeOnTheScreen()
    expect(screen.getByText('day 10')).toBeOnTheScreen()
    await fireEvent(surface, 'responderMove', { nativeEvent: { locationX: 0 } })
    expect(screen.getByText('4 kg')).toBeOnTheScreen()
    await fireEvent(surface, 'responderRelease')
    expect(screen.getByText('4.3 kg')).toBeOnTheScreen()
    expect(surface.props.onStartShouldSetResponder()).toBe(true)
  })

  it('renders a single point without crashing', async () => {
    await render(
      <LineChart {...props} points={[{ key: 'a', x: 5, y: 3000 }]} average={undefined} />,
    )
    expect(screen.getByText('3 kg')).toBeOnTheScreen()
  })
  it('shows the average legend, handles flat data and cancelled gestures', async () => {
    const flat = [
      { key: 'a', x: 0, y: 4000 },
      { key: 'b', x: 10, y: 4000 },
    ]
    await render(<LineChart {...props} points={flat} average={4000} />)
    expect(screen.getByText('avg')).toBeOnTheScreen()
    const surface = screen.getByTestId('line-chart-surface')
    await fireEvent(surface, 'layout', { nativeEvent: { layout: { width: 200, height: 180 } } })
    await fireEvent(surface, 'responderGrant', { nativeEvent: { locationX: 10 } })
    await fireEvent(surface, 'responderTerminate')
    expect(screen.getByText('day 10')).toBeOnTheScreen()
    expect(surface.props.onMoveShouldSetResponder()).toBe(true)
  })

  it('omits the average legend without a label', async () => {
    await render(<LineChart {...props} averageLabel={undefined} height={120} />)
    expect(screen.queryByText('avg')).not.toBeOnTheScreen()
  })
})
