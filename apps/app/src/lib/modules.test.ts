import { renderHook } from '@testing-library/react-native'
import { useUniwind } from 'uniwind'
import { MODULES, useModuleAccent } from './modules'

jest.mock('uniwind', () => ({ useUniwind: jest.fn() }))
const mockUseUniwind = useUniwind as jest.Mock

describe('useModuleAccent', () => {
  it.each([
    ['light', '#e8833a'],
    ['dark', '#f5a05a'],
  ])('returns the pets accent for the %s theme', async (theme, color) => {
    mockUseUniwind.mockReturnValue({ theme })
    const { result } = await renderHook(() => useModuleAccent('pets'))
    expect(result.current).toBe(color)
  })

  it('falls back to a neutral accent for unknown modules', async () => {
    mockUseUniwind.mockReturnValue({ theme: 'light' })
    const { result } = await renderHook(() => useModuleAccent('nope'))
    expect(result.current).toBe('#e7e1d8')
  })

  it('registers the pets module', () => {
    expect(MODULES.map((m) => m.id)).toEqual(['pets'])
  })
})
