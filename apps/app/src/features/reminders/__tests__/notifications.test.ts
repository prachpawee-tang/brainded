import * as Notifications from 'expo-notifications'
import {
  configureNotifications,
  replaceScheduledReminders,
  requestNotificationPermission,
  subscribeToReminderTaps,
} from '../notifications'

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { HIGH: 4 },
  DEFAULT_ACTION_IDENTIFIER: 'expo.modules.notifications.actions.DEFAULT',
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  getLastNotificationResponseAsync: jest.fn(),
}))

const mocked = Notifications as jest.Mocked<typeof Notifications>
const GRANTED = { granted: true } as Notifications.NotificationPermissionsStatus
const DENIED = { granted: false, canAskAgain: false } as Notifications.NotificationPermissionsStatus

const item = (id: string, at: Date) => ({ id, at, title: `T ${id}`, body: 'B', route: '/pets/p1' })
const tapOn = (data: unknown, action = Notifications.DEFAULT_ACTION_IDENTIFIER) =>
  ({
    actionIdentifier: action,
    notification: { request: { content: { data } } },
  }) as unknown as Notifications.NotificationResponse

describe('notifications adapter', () => {
  beforeEach(() => jest.clearAllMocks())

  it('replaces the whole schedule with future items only', async () => {
    mocked.getPermissionsAsync.mockResolvedValue(GRANTED)
    const future = new Date(Date.now() + 3_600_000)
    await replaceScheduledReminders([item('a', future), item('old', new Date(Date.now() - 1000))])
    expect(mocked.cancelAllScheduledNotificationsAsync).toHaveBeenCalled()
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(1)
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: 'a',
      content: { title: 'T a', body: 'B', data: { route: '/pets/p1' } },
      trigger: { type: 'date', date: future, channelId: 'reminders' },
    })
  })

  it('only clears the schedule when notifications are not allowed', async () => {
    mocked.getPermissionsAsync.mockResolvedValue(DENIED)
    await replaceScheduledReminders([item('a', new Date(Date.now() + 3_600_000))])
    expect(mocked.cancelAllScheduledNotificationsAsync).toHaveBeenCalled()
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled()
  })

  it('asks for permission only when not already granted', async () => {
    mocked.getPermissionsAsync.mockResolvedValueOnce(GRANTED)
    expect(await requestNotificationPermission()).toBe(true)
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled()
    mocked.getPermissionsAsync.mockResolvedValueOnce({ granted: false, canAskAgain: true } as never)
    mocked.requestPermissionsAsync.mockResolvedValueOnce(DENIED)
    expect(await requestNotificationPermission()).toBe(false)
  })

  it('shows reminders while the app is open and sets up the Android channel', async () => {
    await configureNotifications('Reminders')
    expect(mocked.setNotificationHandler).toHaveBeenCalled()
    const handler = mocked.setNotificationHandler.mock.calls[0]?.[0]
    await expect(handler?.handleNotification({} as never)).resolves.toMatchObject({
      shouldShowBanner: true,
    })
    expect(mocked.setNotificationChannelAsync).toHaveBeenCalledWith(
      'reminders',
      expect.objectContaining({ name: 'Reminders' }),
    )
  })

  it('opens in-app routes from taps (also the one that launched the app) and ignores anything else', async () => {
    const remove = jest.fn()
    let listener: (r: Notifications.NotificationResponse) => void = () => {}
    mocked.addNotificationResponseReceivedListener.mockImplementation((l) => {
      listener = l
      return { remove }
    })
    mocked.getLastNotificationResponseAsync.mockResolvedValue(tapOn({ route: '/pets/p1' }))
    const onRoute = jest.fn()
    const unsubscribe = subscribeToReminderTaps(onRoute)
    await new Promise((r) => setImmediate(r))
    expect(onRoute).toHaveBeenCalledWith('/pets/p1')
    listener(tapOn({ route: 'https://evil.example' }))
    listener(tapOn({ route: '//evil.example' }))
    listener(tapOn({ route: '/pets/p2' }, 'snooze'))
    listener(tapOn({ route: '/pets/p3' }))
    expect(onRoute.mock.calls).toEqual([['/pets/p1'], ['/pets/p3']])
    unsubscribe()
    expect(remove).toHaveBeenCalled()
  })
})
