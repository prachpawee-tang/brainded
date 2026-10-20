import { render, screen, userEvent } from '@testing-library/react-native'
import { Tile } from './tile'

describe('Tile', () => {
  it('renders title, description and icon as one button', async () => {
    await render(
      <Tile title="Pets" description="Care" icon="🐾" accentColor="#e8833a" onPress={jest.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Pets' })).toBeOnTheScreen()
    expect(screen.getByText('Care')).toBeOnTheScreen()
    expect(screen.getByText('🐾')).toBeOnTheScreen()
  })

  it('calls onPress', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()
    await render(<Tile title="Pets" icon="🐾" accentColor="#e8833a" onPress={onPress} />)
    await user.press(screen.getByRole('button', { name: 'Pets' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
