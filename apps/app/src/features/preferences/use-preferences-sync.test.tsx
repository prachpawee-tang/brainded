import { renderHook, waitFor } from '@testing-library/react-native'
import { Uniwind } from 'uniwind'
import { initI18n } from '@/lib/i18n'
import { usePreferencesSync } from './use-preferences-sync'

jest.mock('uniwind', () => ({ Uniwind: { setTheme: jest.fn() } }))

describe('usePreferencesSync', () => {
  beforeEach(() => jest.clearAllMocks())

  it('applies the viewer language and theme', async () => {
    const i18n = await initI18n('th')
    await renderHook(() => usePreferencesSync(i18n, { locale: 'EN', theme: 'DARK' }))
    await waitFor(() => expect(i18n.language).toBe('en'))
    expect(Uniwind.setTheme).toHaveBeenCalledWith('dark')
  })

  it('does nothing while the viewer is unknown', async () => {
    const i18n = await initI18n('th')
    await renderHook(() => usePreferencesSync(i18n, null))
    expect(i18n.language).toBe('th')
    expect(Uniwind.setTheme).not.toHaveBeenCalled()
  })
})
