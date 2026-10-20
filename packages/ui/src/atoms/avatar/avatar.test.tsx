import { render, screen } from '@testing-library/react-native'
import { Avatar } from './avatar'

describe('Avatar', () => {
  it('shows the photo with the label as its accessible name', async () => {
    await render(
      <Avatar
        label="Mango"
        imageUrl="https://img.test/m.jpg"
        fallback="🐱"
        accentColor="#e8833a"
      />,
    )
    expect(screen.getByLabelText('Mango')).toHaveProp('source', { uri: 'https://img.test/m.jpg' })
    expect(screen.queryByText('🐱')).not.toBeOnTheScreen()
  })

  it('falls back to the glyph on the accent color without a photo', async () => {
    await render(
      <Avatar label="Mango" imageUrl={null} fallback="🐱" accentColor="#e8833a" size="lg" />,
    )
    expect(screen.getByText('🐱')).toBeOnTheScreen()
    expect(screen.getByLabelText('Mango')).toHaveStyle({ backgroundColor: '#e8833a' })
  })
})
