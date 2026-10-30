import type { ReminderItem } from '@brain/core'

// Web has no scheduled local notifications; reminders show in the app (Today) instead.

export const IS_NOTIFICATIONS_SUPPORTED: boolean = false
export const configureNotifications = async (_channelName: string) => {}
export const requestNotificationPermission = async () => false
export const replaceScheduledReminders = async (_items: readonly ReminderItem[]) => {}
export const subscribeToReminderTaps = (_onRoute: (route: string) => void) => () => {}
