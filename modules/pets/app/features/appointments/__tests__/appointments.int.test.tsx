import { toIsoDate } from '@brain/ui'
import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'
import { Alert } from 'react-native'
import {
  AddPetAppointmentMutation,
  SetPetAppointmentStatusMutation,
  UpdatePetAppointmentMutation,
} from '../../../graphql/health'
import { localDateTimeToIso } from '../../../lib/format'
import { PET_ID } from '../../../test/fixtures'
import { appointmentsMock, inDays, TODAY } from '../../../test/health-fixtures'
import { renderPets } from '../../../test/render'
import { AppointmentSheet } from '../components/appointment-sheet'
import { AppointmentsSection } from '../components/appointments-section'
import { AppointmentsScreen } from '../screens/appointments-screen'

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'UGV0OnBldC0x' }),
}))

const APPOINTMENTS = [
  { id: 'a0', reason: 'Old checkup', scheduledAt: inDays(-30), status: 'DONE' as const },
  { id: 'a1', reason: 'Vaccines', scheduledAt: inDays(3), clinic: 'Happy Paws' },
  { id: 'a2', reason: 'Dental', scheduledAt: inDays(20) },
  { id: 'a3', reason: 'Skipped', scheduledAt: inDays(5), status: 'CANCELLED' as const },
]

const existing = {
  __typename: 'PetAppointment' as const,
  id: 'a1',
  reason: 'Vaccines',
  scheduledAt: inDays(3),
  clinic: 'Happy Paws',
  note: null,
  status: 'SCHEDULED' as const,
}

describe('AppointmentsSection', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows only upcoming scheduled appointments', async () => {
    const user = userEvent.setup()
    await renderPets(<AppointmentsSection petId={PET_ID} />, {
      mocks: [appointmentsMock(APPOINTMENTS)],
    })
    expect(await screen.findByRole('button', { name: 'Vaccines' })).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Dental' })).toBeOnTheScreen()
    expect(screen.queryByText('Old checkup')).not.toBeOnTheScreen()
    expect(screen.queryByText('Skipped')).not.toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'See all' }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/appointments`)
  })

  it('opens the editor for an appointment', async () => {
    const user = userEvent.setup()
    await renderPets(<AppointmentsSection petId={PET_ID} />, {
      mocks: [appointmentsMock(APPOINTMENTS)],
    })
    await user.press(await screen.findByRole('button', { name: 'Vaccines' }))
    expect(screen.getByRole('header', { name: 'Edit appointment' })).toBeOnTheScreen()
  })

  it('says when nothing is coming up', async () => {
    await renderPets(<AppointmentsSection petId={PET_ID} />, { mocks: [appointmentsMock([])] })
    expect(await screen.findByText('No upcoming appointments')).toBeOnTheScreen()
  })
})

describe('AppointmentSheet', () => {
  beforeEach(() => jest.clearAllMocks())

  it('adds an appointment from a date and time', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const input = {
      petId: PET_ID,
      scheduledAt: localDateTimeToIso(TODAY, '10:15'),
      reason: 'Vaccines',
      clinic: 'Happy Paws',
      note: null,
    }
    const result = jest.fn(() => ({
      data: {
        addPetAppointment: {
          __typename: 'MutationAddPetAppointmentSuccess',
          data: { __typename: 'PetAppointment', id: 'new' },
        },
      },
    }))
    await renderPets(<AppointmentSheet petId={PET_ID} visible onClose={onClose} />, {
      mocks: [{ request: { query: AddPetAppointmentMutation, variables: { input } }, result }],
    })
    const time = screen.getByLabelText('Time (HH:MM)')
    await user.clear(time)
    await user.type(time, '10:15')
    await user.type(screen.getByLabelText('Reason (e.g. Vaccines)'), 'Vaccines')
    await user.type(screen.getByLabelText('Clinic (optional)'), 'Happy Paws')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  it('validates time and reason', async () => {
    const user = userEvent.setup()
    await renderPets(<AppointmentSheet petId={PET_ID} visible onClose={jest.fn()} />)
    const time = screen.getByLabelText('Time (HH:MM)')
    await user.clear(time)
    await user.type(time, '9')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Use HH:MM, e.g. 08:00')).toBeOnTheScreen()
    expect(screen.getByText('This field is required')).toBeOnTheScreen()
  })

  it('updates an appointment', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const date = existing.scheduledAt
    const local = new Date(date)
    const hhmm = `${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}`
    const isoDay = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`
    const input = {
      id: 'a1',
      scheduledAt: localDateTimeToIso(isoDay, hhmm),
      reason: 'Vaccines + checkup',
      clinic: 'Happy Paws',
      note: null,
    }
    const result = jest.fn(() => ({
      data: {
        updatePetAppointment: {
          __typename: 'MutationUpdatePetAppointmentSuccess',
          data: { ...existing, reason: 'Vaccines + checkup' },
        },
      },
    }))
    await renderPets(
      <AppointmentSheet petId={PET_ID} appointment={existing} visible onClose={onClose} />,
      {
        mocks: [{ request: { query: UpdatePetAppointmentMutation, variables: { input } }, result }],
      },
    )
    const reason = screen.getByDisplayValue('Vaccines')
    await user.clear(reason)
    await user.type(reason, 'Vaccines + checkup')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('marks done and offers to add results', async () => {
    const user = userEvent.setup()
    const result = jest.fn(() => ({
      data: {
        setPetAppointmentStatus: {
          __typename: 'MutationSetPetAppointmentStatusSuccess',
          data: { __typename: 'PetAppointment', id: 'a1', status: 'DONE' },
        },
      },
    }))
    await renderPets(
      <AppointmentSheet petId={PET_ID} appointment={existing} visible onClose={jest.fn()} />,
      {
        mocks: [
          {
            request: {
              query: SetPetAppointmentStatusMutation,
              variables: {
                input: {
                  id: 'a1',
                  status: 'DONE',
                  localDate: toIsoDate(new Date(existing.scheduledAt)),
                },
              },
            },
            result,
          },
        ],
      },
    )
    await user.press(screen.getByRole('button', { name: 'Mark as done' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await user.press(await screen.findByRole('button', { name: 'Add results' }))
    expect(router.push).toHaveBeenCalledWith(`/pets/${PET_ID}/labs/new`)
  })

  it('cancels after confirmation', async () => {
    const user = userEvent.setup()
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.[1]?.onPress?.())
    const onClose = jest.fn()
    const result = jest.fn(() => ({
      data: {
        setPetAppointmentStatus: {
          __typename: 'MutationSetPetAppointmentStatusSuccess',
          data: { __typename: 'PetAppointment', id: 'a1', status: 'CANCELLED' },
        },
      },
    }))
    await renderPets(
      <AppointmentSheet petId={PET_ID} appointment={existing} visible onClose={onClose} />,
      {
        mocks: [
          {
            request: {
              query: SetPetAppointmentStatusMutation,
              variables: { input: { id: 'a1', status: 'CANCELLED' } },
            },
            result,
          },
        ],
      },
    )
    await user.press(screen.getByRole('button', { name: 'Cancel appointment' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })
})

describe('AppointmentsScreen', () => {
  it('splits upcoming and past with status labels', async () => {
    await renderPets(<AppointmentsScreen />, { mocks: [appointmentsMock(APPOINTMENTS)] })
    expect(await screen.findByText('Past')).toBeOnTheScreen()
    expect(screen.getByText('Old checkup')).toBeOnTheScreen()
    expect(screen.getByText('Done')).toBeOnTheScreen()
    expect(screen.getByText('Cancelled')).toBeOnTheScreen()
  })
})
