import { DEFAULT_REMINDER_SETTINGS, type ReminderSettings } from '@brain/core'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useSyncExternalStore } from 'react'

// Notifications are per device, so these settings live on the device, not on the server.
const STORAGE_KEY = 'brain.reminders.v1'

type State = { settings: ReminderSettings; isLoaded: boolean }

let state: State = { settings: DEFAULT_REMINDER_SETTINGS, isLoaded: false }
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()

const setState = (next: State) => {
  state = next
  for (const listener of listeners) listener()
}

const parse = (raw: string | null): ReminderSettings => {
  try {
    return { ...DEFAULT_REMINDER_SETTINGS, ...(raw ? JSON.parse(raw) : {}) }
  } catch {
    return DEFAULT_REMINDER_SETTINGS
  }
}

const loadOnce = () => {
  loading ??= AsyncStorage.getItem(STORAGE_KEY)
    .catch(() => null)
    .then((raw) => setState({ settings: parse(raw), isLoaded: true }))
  return loading
}

/** Forget the loaded state (tests; also handy after sign-out). */
export const resetReminderSettings = () => {
  loading = null
  setState({ settings: DEFAULT_REMINDER_SETTINGS, isLoaded: false })
}

export const updateReminderSettings = async (patch: Partial<ReminderSettings>) => {
  await loadOnce()
  const settings = { ...state.settings, ...patch }
  setState({ settings, isLoaded: true })
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useReminderSettings = (): State => {
  useEffect(() => {
    loadOnce()
  }, [])
  return useSyncExternalStore(subscribe, () => state)
}
