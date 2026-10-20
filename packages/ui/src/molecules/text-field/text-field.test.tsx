import { render, screen, userEvent } from '@testing-library/react-native'
import { TextField } from './text-field'

describe('TextField', () => {
  it('is reachable by its label', async () => {
    await render(<TextField label="Username" value="" onChangeText={jest.fn()} />)
    expect(screen.getByLabelText('Username')).toBeOnTheScreen()
    expect(screen.getByText('Username')).toBeOnTheScreen()
  })

  it('reports typed text', async () => {
    const user = userEvent.setup()
    const onChangeText = jest.fn()
    await render(<TextField label="Username" value="" onChangeText={onChangeText} />)
    await user.type(screen.getByLabelText('Username'), 'tnk')
    expect(onChangeText).toHaveBeenLastCalledWith('k')
  })

  it('shows the error as an alert', async () => {
    await render(
      <TextField label="Email" value="x" onChangeText={jest.fn()} error="Invalid email" />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
  })

  it('has no alert without an error', async () => {
    await render(<TextField label="Email" value="x" onChangeText={jest.fn()} />)
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen()
  })
})
