import { render, screen, userEvent } from '@testing-library/react-native'
import { Button } from './button'

describe('Button', () => {
  it('renders the label as an accessible button', async () => {
    await render(<Button label="Save" onPress={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })

  it('calls onPress when pressed', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()
    await render(<Button label="Save" onPress={onPress} />)
    await user.press(screen.getByRole('button', { name: 'Save' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()
    await render(<Button label="Save" onPress={onPress} disabled />)
    await user.press(screen.getByRole('button', { name: 'Save' }))
    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('shows a busy spinner and blocks presses while loading', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()
    await render(<Button label="Save" onPress={onPress} loading />)
    await user.press(screen.getByRole('button', { name: 'Save' }))
    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Save' })).toBeBusy()
    expect(screen.getByTestId('button-spinner')).toBeOnTheScreen()
  })

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)(
    'supports the %s variant',
    async (variant) => {
      await render(<Button label="Go" onPress={jest.fn()} variant={variant} />)
      expect(screen.getByRole('button', { name: 'Go' })).toBeOnTheScreen()
    },
  )

  it('uses compact text for the small size', async () => {
    await render(<Button label="Go" onPress={jest.fn()} size="sm" />)
    expect(screen.getByText('Go')).toHaveProp('className', expect.stringContaining('text-sm'))
  })
})

describe('Button with icon', () => {
  it('shows a leading icon and keeps the label as its name', async () => {
    const { Plus } = jest.requireActual('lucide-react-native')
    await render(<Button label="Weight" icon={Plus} onPress={jest.fn()} />)
    expect(screen.getByRole('button', { name: 'Weight' })).toBeOnTheScreen()
    expect(screen.getByTestId('button-icon', { includeHiddenElements: true })).toBeOnTheScreen()
  })
})
