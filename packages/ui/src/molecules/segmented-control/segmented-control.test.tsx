import { render, screen, userEvent } from '@testing-library/react-native'
import { SegmentedControl } from './segmented-control'

const OPTIONS = [
  { value: 'th', label: 'ไทย' },
  { value: 'en', label: 'English' },
] as const

describe('SegmentedControl', () => {
  it('marks the selected option', async () => {
    await render(
      <SegmentedControl label="Language" options={OPTIONS} value="th" onChange={jest.fn()} />,
    )
    expect(screen.getByRole('radio', { name: 'ไทย' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'English' })).not.toBeChecked()
  })

  it('reports the chosen option', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    await render(
      <SegmentedControl label="Language" options={OPTIONS} value="th" onChange={onChange} />,
    )
    await user.press(screen.getByRole('radio', { name: 'English' }))
    expect(onChange).toHaveBeenCalledWith('en')
  })
})
