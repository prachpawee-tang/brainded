import { render, screen, userEvent } from '@testing-library/react-native'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('shows the glyph, message and an optional action', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()
    await render(
      <EmptyState glyph="🐾" message="No pets yet" action={{ label: 'Add pet', onPress }} />,
    )
    expect(screen.getByText('No pets yet')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Add pet' }))
    expect(onPress).toHaveBeenCalled()
  })

  it('renders without an action', async () => {
    await render(<EmptyState glyph="🫙" message="Nothing here" />)
    expect(screen.queryByRole('button')).not.toBeOnTheScreen()
  })
})
