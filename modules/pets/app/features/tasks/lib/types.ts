import type { PetTasksQuery } from '../../../graphql/generated/graphql'

export type Task = NonNullable<PetTasksQuery['pet']>['tasks'][number]

/** Open to-dos due today or earlier (undated ones never count as due). */
export const isDue = (
  task: { dueOn?: string | null; completedAt?: string | null },
  today: string,
) => !task.completedAt && Boolean(task.dueOn) && (task.dueOn as string) <= today
