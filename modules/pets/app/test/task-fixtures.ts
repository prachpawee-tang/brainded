import { PetTasksQuery } from '../graphql/tasks'
import { PET_ID } from './fixtures'

export type TaskFixture = {
  id: string
  title: string
  dueOn?: string | null
  note?: string | null
  completedAt?: string | null
}

export const tasksMock = (tasks: TaskFixture[], includeDone?: boolean) => ({
  request: {
    query: PetTasksQuery,
    variables: includeDone === undefined ? { id: PET_ID } : { id: PET_ID, includeDone },
  },
  result: {
    data: {
      pet: {
        __typename: 'Pet' as const,
        id: PET_ID,
        tasks: tasks.map((t) => ({
          __typename: 'PetTask' as const,
          dueOn: null,
          note: null,
          completedAt: null,
          ...t,
        })),
      },
    },
  },
})
