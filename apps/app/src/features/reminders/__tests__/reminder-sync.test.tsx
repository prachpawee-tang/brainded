import { usePetsReminderItems } from '@brain/module-pets/app'
import { render, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'
import { createTestProviders } from '@/test/create-test-providers'
import { buildViewer, viewerMock } from '@/test/viewer-fixture'
import { replaceScheduledReminders, subscribeToReminderTaps } from '../notifications'
import { useReminderSettings } from '../reminder-settings'
import { ReminderSync } from '../reminder-sync'

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }))
jest.mock('@brain/module-pets/app', () => ({ usePetsReminderItems: jest.fn() }))
jest.mock('../reminder-settings', () => ({ useReminderSettings: jest.fn() }))
jest.mock('../notifications', () => ({
  IS_NOTIFICATIONS_SUPPORTED: true,
  configureNotifications: jest.fn(),
  replaceScheduledReminders: jest.fn(),
  subscribeToReminderTaps: jest.fn(() => () => {}),
}))

const ON = { isEnabled: true, doses: true, appointments: true, tasks: true }
const ITEM = {
  id: 'pets.task:t1',
  at: new Date('2026-11-05T02:00:00Z'),
  title: 'T',
  body: 'B',
  route: '/pets/p1',
}

const setup = async ({ items, isLoaded = true }: { items: unknown; isLoaded?: boolean }) => {
  jest.mocked(useReminderSettings).mockReturnValue({ settings: ON, isLoaded })
  jest.mocked(usePetsReminderItems).mockReturnValue(items as never)
  const wrapper = await createTestProviders({ mocks: [viewerMock()] })
  return render(<ReminderSync />, { wrapper })
}

describe('ReminderSync', () => {
  beforeEach(() => jest.clearAllMocks())

  it('schedules the planned reminders once settings are loaded', async () => {
    await setup({ items: [ITEM] })
    await waitFor(() => expect(replaceScheduledReminders).toHaveBeenCalledWith([ITEM]))
  })

  it('does not reschedule when the planned set is unchanged', async () => {
    const view = await setup({ items: [ITEM] })
    await waitFor(() => expect(replaceScheduledReminders).toHaveBeenCalledTimes(1))
    jest.mocked(usePetsReminderItems).mockReturnValue([{ ...ITEM }])
    await view.rerender(<ReminderSync />)
    expect(replaceScheduledReminders).toHaveBeenCalledTimes(1)
  })

  it('keeps the current schedule while data or settings are unknown', async () => {
    await setup({ items: null })
    await setup({ items: [ITEM], isLoaded: false })
    await new Promise((r) => setTimeout(r, 50))
    expect(replaceScheduledReminders).not.toHaveBeenCalled()
  })

  it('plans nothing for pets when the pets module is turned off', async () => {
    jest.mocked(useReminderSettings).mockReturnValue({ settings: ON, isLoaded: true })
    jest.mocked(usePetsReminderItems).mockReturnValue([])
    const wrapper = await createTestProviders({
      mocks: [
        viewerMock(
          buildViewer({
            modules: [{ __typename: 'UserModule', moduleId: 'pets', enabled: false }],
          }),
        ),
      ],
    })
    await render(<ReminderSync />, { wrapper })
    await waitFor(() => expect(replaceScheduledReminders).toHaveBeenCalledWith([]))
    expect(usePetsReminderItems).toHaveBeenLastCalledWith(
      expect.objectContaining({ isEnabled: false }),
    )
  })

  it('opens the route of a tapped reminder', async () => {
    await setup({ items: [] })
    const onRoute = jest.mocked(subscribeToReminderTaps).mock.calls[0]?.[0]
    onRoute?.('/pets/p1')
    expect(router.push).toHaveBeenCalledWith('/pets/p1')
  })
})
