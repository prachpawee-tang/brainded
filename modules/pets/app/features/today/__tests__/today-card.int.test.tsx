import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'
import { SetDoseTakenMutation } from '../../../graphql/health'
import { PET_ID } from '../../../test/fixtures'
import { inDays, TODAY, todayMock } from '../../../test/health-fixtures'
import { renderPets } from '../../../test/render'
import { TodayCard } from '../components/today-card'

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }))

describe('TodayCard', () => {
  beforeEach(() => jest.clearAllMocks())

  it("checks off today's doses", async () => {
    const user = userEvent.setup()
    const result = jest.fn(() => ({
      data: {
        setDoseTaken: {
          __typename: 'MutationSetDoseTakenSuccess',
          data: {
            __typename: 'PetDose',
            id: `m1:${TODAY}:08:00`,
            takenAt: '2026-10-20T01:00:00.000Z',
          },
        },
      },
    }))
    await renderPets(<TodayCard petId={PET_ID} />, {
      mocks: [
        todayMock([
          { medicationId: 'm1', name: 'Apoquel', dosage: '½ tablet', time: '08:00' },
          {
            medicationId: 'm1',
            name: 'Apoquel',
            dosage: '½ tablet',
            time: '20:00',
            takenAt: '2026-10-20T13:00:00.000Z',
          },
        ]),
        {
          request: {
            query: SetDoseTakenMutation,
            variables: { input: { medicationId: 'm1', date: TODAY, time: '08:00', taken: true } },
          },
          result,
        },
      ],
    })
    const morning = await screen.findByRole('checkbox', { name: '08:00 · Apoquel ½ tablet' })
    expect(morning).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: '20:00 · Apoquel ½ tablet' })).toBeChecked()
    await user.press(morning)
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: '08:00 · Apoquel ½ tablet' })).toBeChecked(),
    )
  })

  it('shows the next appointment and opens the list', async () => {
    const user = userEvent.setup()
    await renderPets(<TodayCard petId={PET_ID} />, {
      mocks: [todayMock([], { reason: 'Vaccines', scheduledAt: inDays(3) })],
    })
    expect(await screen.findByText('No doses today')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: /Vaccines/ }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/appointments`)
  })

  it('says when nothing is scheduled', async () => {
    await renderPets(<TodayCard petId={PET_ID} />, { mocks: [todayMock([])] })
    expect(await screen.findByText('No upcoming appointments')).toBeOnTheScreen()
  })
})
