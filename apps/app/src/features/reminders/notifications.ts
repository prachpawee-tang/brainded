import type { ReminderItem } from '@brain/core'
import * as Notifications from 'expo-notifications'

// Local notifications adapter (iOS/Android). `notifications.web.ts` is the no-op web twin.

export const IS_NOTIFICATIONS_SUPPORTED: boolean = true
const CHANNEL_ID = 'reminders'

export const configureNotifications = async (channelName: string) => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
  // No-op on iOS; required on Android for a named channel instead of "Miscellaneous".
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: channelName,
    importance: Notifications.AndroidImportance.HIGH,
  })
}

export const requestNotificationPermission = async () => {
  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true
  if (current.canAskAgain === false) return false
  return (await Notifications.requestPermissionsAsync()).granted
}

/** Every reminder is ours, so a full replace keeps the device in step with the plan. */
export const replaceScheduledReminders = async (items: readonly ReminderItem[]) => {
  await Notifications.cancelAllScheduledNotificationsAsync()
  if (!(await Notifications.getPermissionsAsync()).granted) return
  const now = Date.now()
  for (const item of items) {
    if (item.at.getTime() <= now) continue
    await Notifications.scheduleNotificationAsync({
      identifier: item.id,
      content: { title: item.title, body: item.body, data: { route: item.route } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: item.at,
        channelId: CHANNEL_ID,
      },
    })
  }
}

/** In-app paths only: never let notification data send the user to another site. */
const routeOf = (response: Notifications.NotificationResponse | null) => {
  if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER)
    return null
  const route = response.notification.request.content.data?.route
  return typeof route === 'string' && route.startsWith('/') && !route.startsWith('//')
    ? route
    : null
}

export const subscribeToReminderTaps = (onRoute: (route: string) => void) => {
  const handle = (response: Notifications.NotificationResponse | null) => {
    const route = routeOf(response)
    if (route) onRoute(route)
  }
  // The tap that cold-started the app arrives before any listener exists.
  Notifications.getLastNotificationResponseAsync().then(handle)
  const subscription = Notifications.addNotificationResponseReceivedListener(handle)
  return () => subscription.remove()
}
