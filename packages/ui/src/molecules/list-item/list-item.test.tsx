import { render, screen, userEvent } from '@testing-library/react-native'
import { Text } from 'react-native'
import { ListItem } from './list-item'

describe('ListItem', () => {
  it('is one button with title, subtitle and trailing content', async () => {
    const user = userEvent.setup()
    const onPress = jest.fn()
    await render(
      <ListItem
        title="Blood test"
        subtitle="1 Oct"
        trailing={<Text>2 high</Text>}
        onPress={onPress}
      />,
    )
    expect(screen.getByText('2 high')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Blood test' }))
    expect(onPress).toHaveBeenCalled()
  })

  it('renders as static text without onPress', async () => {
    await render(<ListItem title="4.2 kg" subtitle="1 Oct" />)
    expect(screen.queryByRole('button')).not.toBeOnTheScreen()
    expect(screen.getByText('1 Oct')).toBeOnTheScreen()
  })
})
