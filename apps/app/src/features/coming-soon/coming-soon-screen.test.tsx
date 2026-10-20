import { render, screen, userEvent } from '@testing-library/react-native'
import { router } from 'expo-router'
import { createTestProviders } from '@/test/create-test-providers'
import { ComingSoonScreen } from './screens/coming-soon-screen'

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }))

describe('ComingSoonScreen', () => {
  it('shows the module name and goes back', async () => {
    const user = userEvent.setup()
    await render(<ComingSoonScreen moduleId="pets" />, {
      wrapper: await createTestProviders({ lng: 'th' }),
    })
    expect(screen.getByRole('header', { name: 'สัตว์เลี้ยง' })).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'กลับ' }))
    expect(router.back).toHaveBeenCalled()
  })
})
