import { render, screen, userEvent } from '@testing-library/react-native'
import { ChevronLeft } from 'lucide-react-native'
import { IconButton } from './icon-button'

describe('IconButton', () => {
  it('is a button named by its label', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()
    await render(<IconButton icon={ChevronLeft} label="Back" onPress={onPress} />)
    await user.press(screen.getByRole('button', { name: 'Back' }))
    expect(onPress).toHaveBeenCalled()
  })

  it.each(['ghost', 'soft', 'primary'] as const)('supports the %s variant', async (variant) => {
    await render(
      <IconButton icon={ChevronLeft} label="Back" variant={variant} onPress={jest.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled()
  })

  it('can be disabled', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()
    await render(<IconButton icon={ChevronLeft} label="Back" onPress={onPress} disabled />)
    await user.press(screen.getByRole('button', { name: 'Back' }))
    expect(onPress).not.toHaveBeenCalled()
  })
})
