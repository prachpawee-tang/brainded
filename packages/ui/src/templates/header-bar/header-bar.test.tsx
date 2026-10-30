import { render, screen, userEvent } from '@testing-library/react-native'
import { Pencil, Trash2 } from 'lucide-react-native'
import { HeaderBar } from './header-bar'

describe('HeaderBar', () => {
  it('has an icon-only back button named for screen readers', async () => {
    const user = userEvent.setup()
    const onBack = jest.fn()
    await render(<HeaderBar backLabel="Back" onBack={onBack} />)
    await user.press(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalled()
    expect(screen.queryByRole('header')).not.toBeOnTheScreen()
  })

  it('shows an optional title and icon actions', async () => {
    const user = userEvent.setup()
    const onEdit = jest.fn()
    const onDelete = jest.fn()
    await render(
      <HeaderBar
        backLabel="Back"
        onBack={jest.fn()}
        title="New vet results"
        actions={[
          { label: 'Edit', icon: Pencil, onPress: onEdit },
          { label: 'Delete', icon: Trash2, onPress: onDelete },
        ]}
      />,
    )
    expect(screen.getByText('New vet results')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Edit' }))
    await user.press(screen.getByRole('button', { name: 'Delete' }))
    expect(onEdit).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalled()
  })
})
