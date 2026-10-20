import { render, screen } from '@testing-library/react-native'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('is hidden from screen readers', async () => {
    await render(<Skeleton testID="sk" className="h-4 w-24" />)
    expect(screen.getByTestId('sk', { includeHiddenElements: true })).not.toBeVisible()
  })
})
