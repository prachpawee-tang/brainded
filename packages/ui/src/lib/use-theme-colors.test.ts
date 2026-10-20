import { renderHook } from '@testing-library/react-native'
import { useUniwind } from 'uniwind'
import { colors } from '../tokens/color'
import { useThemeColors } from './use-theme-colors'

const mockUseUniwind = useUniwind as jest.Mock

describe('useThemeColors', () => {
  it.each(['light', 'dark'] as const)('returns %s colors', async (theme) => {
    mockUseUniwind.mockReturnValue({ theme })
    const { result } = await renderHook(() => useThemeColors())
    expect(result.current.surface).toBe(colors[theme].surface)
  })
})
