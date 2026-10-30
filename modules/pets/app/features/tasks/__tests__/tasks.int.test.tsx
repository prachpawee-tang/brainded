import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Alert } from 'react-native'
import {
  AddPetTaskMutation,
  DeletePetTaskMutation,
  UpdatePetTaskMutation,
} from '../../../graphql/tasks'
import { PET_ID } from '../../../test/fixtures'
import { renderPets } from '../../../test/render'
import { tasksMock } from '../../../test/task-fixtures'
import { TaskSheet } from '../components/task-sheet'
import { TasksScreen } from '../screens/tasks-screen'

jest.mock('expo-router', () => ({
  router: { canGoBack: () => true, push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: 'UGV0OnBldC0x' }),
}))

const _doneResult = (id: string, completedAt: string | null) =>
  jest.fn(() => ({
    data: {
      setPetTaskDone: {
        __typename: 'MutationSetPetTaskDoneSuccess',
        data: { __typename: 'PetTask', id, completedAt },
      },
    },
  }))

describe('TaskSheet', () => {
  beforeEach(() => jest.clearAllMocks())

  it('adds a to-do', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    const result = jest.fn(() => ({
      data: {
        addPetTask: {
          __typename: 'MutationAddPetTaskSuccess',
          data: { __typename: 'PetTask', id: 'new' },
        },
      },
    }))
    await renderPets(<TaskSheet petId={PET_ID} visible onClose={onClose} />, {
      mocks: [
        {
          request: {
            query: AddPetTaskMutation,
            variables: { input: { petId: PET_ID, title: 'Buy food', note: null, dueOn: null } },
          },
          result,
        },
      ],
    })
    await user.type(screen.getByLabelText('What needs doing?'), 'Buy food')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(onClose).toHaveBeenCalled()
  })

  it('validates the title', async () => {
    const user = userEvent.setup()
    await renderPets(<TaskSheet petId={PET_ID} visible onClose={jest.fn()} />)
    await user.press(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('This field is required')).toBeOnTheScreen()
  })

  it('edits and deletes a to-do', async () => {
    const user = userEvent.setup()
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.[1]?.onPress?.())
    const onClose = jest.fn()
    const task = {
      __typename: 'PetTask' as const,
      id: 't1',
      title: 'Old',
      note: null,
      dueOn: '2026-11-07',
      completedAt: null,
    }
    const update = jest.fn(() => ({
      data: {
        updatePetTask: {
          __typename: 'MutationUpdatePetTaskSuccess',
          data: { ...task, title: 'New' },
        },
      },
    }))
    const remove = jest.fn(() => ({
      data: { deletePetTask: { __typename: 'MutationDeletePetTaskSuccess' } },
    }))
    await renderPets(<TaskSheet petId={PET_ID} task={task} visible onClose={onClose} />, {
      mocks: [
        {
          request: {
            query: UpdatePetTaskMutation,
            variables: { input: { id: 't1', title: 'New', note: null, dueOn: '2026-11-07' } },
          },
          result: update,
        },
        {
          request: { query: DeletePetTaskMutation, variables: { input: { id: 't1' } } },
          result: remove,
        },
      ],
    })
    const title = screen.getByDisplayValue('Old')
    await user.clear(title)
    await user.type(title, 'New')
    await user.press(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(update).toHaveBeenCalled())
    await user.press(screen.getByRole('button', { name: 'Delete to-do' }))
    await waitFor(() => expect(remove).toHaveBeenCalled())
  })
})

describe('TasksScreen', () => {
  it('shows open and done to-dos', async () => {
    await renderPets(<TasksScreen />, {
      mocks: [
        tasksMock(
          [
            { id: 't1', title: 'Open one' },
            { id: 't2', title: 'Finished', completedAt: '2026-11-01T00:00:00.000Z' },
          ],
          true,
        ),
      ],
    })
    expect(await screen.findByText('Finished')).toBeOnTheScreen()
    expect(screen.getByRole('checkbox', { name: 'Finished' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Open one' })).not.toBeChecked()
  })
})
