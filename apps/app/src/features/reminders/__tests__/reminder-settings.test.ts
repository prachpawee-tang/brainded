import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, renderHook, waitFor } from '@testing-library/react-native'

import {
  resetReminderSettings,
  updateReminderSettings,
  useReminderSettings,
} from '../reminder-settings'

describe('reminder settings', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
    resetReminderSettings()
  })

  it('starts off, with every kind selected, until the device says otherwise', async () => {
    const { result } = await renderHook(() => useReminderSettings())
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    expect(result.current.settings).toEqual({
      isEnabled: false,
      doses: true,
      appointments: true,
      tasks: true,
    })
  })

  it('reads stored settings and fills in kinds added later', async () => {
    await AsyncStorage.setItem(
      'brain.reminders.v1',
      JSON.stringify({ isEnabled: true, doses: false }),
    )
    const { result } = await renderHook(() => useReminderSettings())
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    expect(result.current.settings).toEqual({
      isEnabled: true,
      doses: false,
      appointments: true,
      tasks: true,
    })
  })

  it('saves changes on this device and updates every subscriber', async () => {
    const first = await renderHook(() => useReminderSettings())
    const second = await renderHook(() => useReminderSettings())
    await waitFor(() => expect(first.result.current.isLoaded).toBe(true))
    await act(() => updateReminderSettings({ isEnabled: true, tasks: false }))
    expect(second.result.current.settings).toMatchObject({ isEnabled: true, tasks: false })
    expect(JSON.parse((await AsyncStorage.getItem('brain.reminders.v1')) ?? '{}')).toMatchObject({
      isEnabled: true,
      tasks: false,
    })
  })

  it('falls back to defaults when stored data is broken', async () => {
    await AsyncStorage.setItem('brain.reminders.v1', '{not json')
    const { result } = await renderHook(() => useReminderSettings())
    await waitFor(() => expect(result.current.isLoaded).toBe(true))
    expect(result.current.settings.isEnabled).toBe(false)
  })
})
