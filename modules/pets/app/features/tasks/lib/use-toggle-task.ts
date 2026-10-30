import { useMutation } from '@apollo/client/react'
import { SetPetTaskDoneMutation } from '../../../graphql/tasks'

/** Tick a to-do on/off with an optimistic update; lists and reminders refetch. */
export const useToggleTask = () => {
  const [setDone] = useMutation(SetPetTaskDoneMutation, {
    refetchQueries: ['PetTasks', 'PetToday', 'PetsReminderSources'],
  })
  return (id: string, done: boolean) =>
    setDone({
      variables: { input: { id, done } },
      optimisticResponse: {
        __typename: 'Mutation',
        setPetTaskDone: {
          __typename: 'MutationSetPetTaskDoneSuccess',
          data: { __typename: 'PetTask', id, completedAt: done ? new Date().toISOString() : null },
        },
      },
    })
}
