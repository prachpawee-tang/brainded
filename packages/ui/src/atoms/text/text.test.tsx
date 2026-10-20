import { render, screen } from '@testing-library/react-native'
import { Text } from './text'

describe('Text', () => {
  it('renders its children', async () => {
    await render(<Text>สวัสดี</Text>)
    expect(screen.getByText('สวัสดี')).toBeOnTheScreen()
  })

  it.each(['display', 'title'] as const)(
    'marks %s variant as a header for screen readers',
    async (variant) => {
      await render(<Text variant={variant}>Heading</Text>)
      expect(screen.getByRole('header', { name: 'Heading' })).toBeOnTheScreen()
    },
  )

  it('does not mark body text as a header', async () => {
    await render(<Text>Body</Text>)
    expect(screen.queryByRole('header')).not.toBeOnTheScreen()
  })

  it('lets callers override conflicting classes', async () => {
    await render(<Text className="text-danger">Error</Text>)
    expect(screen.getByText('Error')).toHaveProp('className', 'font-sans text-base text-danger')
  })
})
