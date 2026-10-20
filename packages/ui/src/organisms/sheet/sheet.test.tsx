import { render, screen, userEvent } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Sheet } from './sheet'

describe('Sheet', () => {
  it('shows its title and content when visible', async () => {
    await render(
      <Sheet visible title="Log weight" closeLabel="Close" onClose={jest.fn()}>
        <Text>body</Text>
      </Sheet>,
    )
    expect(screen.getByRole('header', { name: 'Log weight' })).toBeOnTheScreen()
    expect(screen.getByText('body')).toBeOnTheScreen()
  })

  it('closes from the close button', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    await render(
      <Sheet visible title="Log weight" closeLabel="Close" onClose={onClose}>
        <Text>body</Text>
      </Sheet>,
    )
    await user.press(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders nothing when hidden', async () => {
    await render(
      <Sheet visible={false} title="Log weight" closeLabel="Close" onClose={jest.fn()}>
        <Text>body</Text>
      </Sheet>,
    )
    expect(screen.queryByText('body')).not.toBeOnTheScreen()
  })
})
