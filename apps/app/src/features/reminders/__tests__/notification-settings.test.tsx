import AsyncStorage from '@react-native-async-storage/async-storage'
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'
import { createTestProviders } from '@/test/create-test-providers'
import { NotificationSettings } from '../components/notification-settings'
import * as notifications from '../notifications'
import { resetReminderSettings } from '../reminder-settings'

jest.mock('../notifications', () => ({
  IS_NOTIFICATIONS_SUPPORTED: true,
  requestNotificationPermission: jest.fn(),
}))

const mocked = notifications as jest.Mocked<typeof notifications> & {
  IS_NOTIFICATIONS_SUPPORTED: boolean
}

const setup = async () => {
  const user = userEvent.setup()
  await render(<NotificationSettings />, { wrapper: await createTestProviders({ lng: 'en' }) })
  await screen.findByRole('switch', { name: 'Reminders on this device' })
  return user
}

describe('NotificationSettings', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    mocked.IS_NOTIFICATIONS_SUPPORTED = true
    await AsyncStorage.clear()
    resetReminderSettings()
  })

  it('asks for permission, then turns reminders on and shows each kind', async () => {
    mocked.requestNotificationPermission.mockResolvedValue(true)
    const user = await setup()
    expect(screen.queryByRole('switch', { name: 'Medication doses' })).not.toBeOnTheScreen()
    await user.press(screen.getByRole('switch', { name: 'Reminders on this device' }))
    expect(await screen.findByRole('switch', { name: 'Medication doses' })).toBeChecked()
    await user.press(screen.getByRole('switch', { name: 'To-dos' }))
    await waitFor(() => expect(screen.getByRole('switch', { name: 'To-dos' })).not.toBeChecked())
    expect(JSON.parse((await AsyncStorage.getItem('brain.reminders.v1')) ?? '{}')).toMatchObject({
      isEnabled: true,
      tasks: false,
    })
  })

  it('stays off and explains when permission is refused', async () => {
    mocked.requestNotificationPermission.mockResolvedValue(false)
    const user = await setup()
    await user.press(screen.getByRole('switch', { name: 'Reminders on this device' }))
    expect(await screen.findByText(/Notifications are blocked/)).toBeOnTheScreen()
    expect(screen.getByRole('switch', { name: 'Reminders on this device' })).not.toBeChecked()
  })

  it('turns reminders off without asking', async () => {
    await AsyncStorage.setItem('brain.reminders.v1', JSON.stringify({ isEnabled: true }))
    const user = await setup()
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Reminders on this device' })).toBeChecked(),
    )
    await user.press(screen.getByRole('switch', { name: 'Reminders on this device' }))
    await waitFor(() =>
      expect(screen.getByRole('switch', { name: 'Reminders on this device' })).not.toBeChecked(),
    )
    expect(mocked.requestNotificationPermission).not.toHaveBeenCalled()
  })

  it('on the web, says reminders live in the mobile app', async () => {
    mocked.IS_NOTIFICATIONS_SUPPORTED = false
    await render(<NotificationSettings />, { wrapper: await createTestProviders({ lng: 'en' }) })
    expect(await screen.findByText(/pop up in the mobile app/)).toBeOnTheScreen()
    expect(screen.queryByRole('switch')).not.toBeOnTheScreen()
  })
})
