import { render, screen } from '@testing-library/react-native'
import { Settings } from 'lucide-react-native'
import { useUniwind } from 'uniwind'
import { colors } from '../../tokens/color'
import { Icon } from './icon'

describe('Icon', () => {
  it('renders decoratively in the tone color at the requested size', async () => {
    ;(useUniwind as jest.Mock).mockReturnValue({ theme: 'light' })
    await render(<Icon icon={Settings} tone="primary" size="lg" testID="icon" />)
    const icon = screen.getByTestId('icon', { includeHiddenElements: true })
    expect(icon).toHaveProp('stroke', colors.light.primary)
    expect(icon).toHaveProp('width', 24)
  })

  it('defaults to the body text color, medium size', async () => {
    ;(useUniwind as jest.Mock).mockReturnValue({ theme: 'dark' })
    await render(<Icon icon={Settings} testID="icon" />)
    const icon = screen.getByTestId('icon', { includeHiddenElements: true })
    expect(icon).toHaveProp('stroke', colors.dark.text)
    expect(icon).toHaveProp('width', 20)
  })
})
