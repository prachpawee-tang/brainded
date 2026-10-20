import { render, screen, userEvent } from '@testing-library/react-native'
import { Switch } from './switch'

describe('Switch', () => {
  it('exposes its state to screen readers', async () => {
    await render(<Switch label="Pets" value onValueChange={jest.fn()} />)
    expect(screen.getByRole('switch', { name: 'Pets' })).toBeChecked()
  })

  it('toggles to the opposite value when pressed', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    await render(<Switch label="Pets" value={false} onValueChange={onValueChange} />)
    await user.press(screen.getByRole('switch', { name: 'Pets' }))
    expect(onValueChange).toHaveBeenCalledWith(true)
  })

  it('ignores presses when disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()
    await render(<Switch label="Pets" value onValueChange={onValueChange} disabled />)
    await user.press(screen.getByRole('switch', { name: 'Pets' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
