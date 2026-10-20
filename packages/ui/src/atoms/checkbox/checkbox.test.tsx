import { render, screen, userEvent } from '@testing-library/react-native'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('reports its state and toggles', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    await render(<Checkbox label="08:00 Apoquel" value={false} onValueChange={onValueChange} />)
    expect(screen.getByRole('checkbox', { name: '08:00 Apoquel' })).not.toBeChecked()
    await user.press(screen.getByRole('checkbox'))
    expect(onValueChange).toHaveBeenCalledWith(true)
  })

  it('shows checked state', async () => {
    await render(<Checkbox label="x" value onValueChange={jest.fn()} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
