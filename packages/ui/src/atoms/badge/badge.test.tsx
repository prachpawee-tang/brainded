import { render, screen } from '@testing-library/react-native'
import { Badge } from './badge'

describe('Badge', () => {
  it.each(['neutral', 'primary', 'success', 'warning', 'danger'] as const)(
    'renders the %s tone',
    async (tone) => {
      await render(<Badge label="วัคซีน" tone={tone} />)
      expect(screen.getByText('วัคซีน')).toBeOnTheScreen()
    },
  )
})
