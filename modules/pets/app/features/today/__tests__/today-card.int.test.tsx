import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'
import { SetDoseTakenMutation } from '../../../graphql/health'
import { SetPetTaskDoneMutation } from '../../../graphql/tasks'
import { PET_ID } from '../../../test/fixtures'
import { daysFromToday, inDays, TODAY, todayMock } from '../../../test/health-fixtures'
import { renderPets } from '../../../test/render'
import { TodayCard } from '../components/today-card'

jest.mock('expo-router', () => ({ router: { canGoBack: () => true, push: jest.fn() } }))

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

describe('TodayCard to-dos', () => {
  it('lists open to-dos due today or overdue, and hides future ones', async () => {
    await renderPets(<TodayCard petId={PET_ID} />, {
      mocks: [
        todayMock([], null, [
          { id: 't1', title: 'Overdue chore', dueOn: daysFromToday(-2) },
          { id: 't2', title: 'Due today', dueOn: daysFromToday(0) },
          { id: 't3', title: 'Next week', dueOn: daysFromToday(7) },
          { id: 't4', title: 'No date', dueOn: null },
        ]),
      ],
    })
    expect(await screen.findByRole('checkbox', { name: 'Overdue chore' })).toBeOnTheScreen()
    expect(screen.getByRole('checkbox', { name: 'Due today' })).toBeOnTheScreen()
    expect(screen.queryByText('Next week')).not.toBeOnTheScreen()
    expect(screen.queryByText('No date')).not.toBeOnTheScreen()
  })
})

describe('TodayCard ticking a to-do', () => {
  it('keeps it struck through for a moment before it goes', async () => {
    const user = userEvent.setup()
    const task = { id: 't1', title: 'Due today', dueOn: daysFromToday(0) }
    const result = jest.fn(() => ({
      data: {
        setPetTaskDone: {
          __typename: 'MutationSetPetTaskDoneSuccess',
          data: { __typename: 'PetTask', id: 't1', completedAt: new Date().toISOString() },
        },
      },
    }))
    await renderPets(<TodayCard petId={PET_ID} />, {
      mocks: [
        todayMock([], null, [task]),
        {
          request: {
            query: SetPetTaskDoneMutation,
            variables: { input: { id: 't1', done: true } },
          },
          result,
        },
        todayMock([], null, []),
      ],
    })
    await user.press(await screen.findByRole('checkbox', { name: 'Due today' }))
    expect(screen.getByRole('checkbox', { name: 'Due today' })).toBeChecked()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(screen.getByText('Due today')).toBeOnTheScreen()
    await waitFor(() => expect(screen.queryByText('Due today')).not.toBeOnTheScreen(), {
      timeout: 3000,
    })
  })
})
