import { createTask, deleteTask, listTasks, setTaskCompleted, updateTask } from '@brain/core/server'
import { NotFoundError } from '@brain/graphql'
import { taskInputSchema } from '../../../shared/health'
import { type PetsServiceContext, parseOrThrow } from '../../lib/context'
import { requirePet } from '../profile/profile.service'
import { PET_ENTITY_TYPE } from '../weight/weight.service'

const TASK_NOT_FOUND = 'TASK_NOT_FOUND'

const orNotFound = <T>(value: T | null | false): T => {
  if (!value) throw new NotFoundError(TASK_NOT_FOUND)
  return value
}

/** Malformed ids behave like missing tasks. */
const requireId = (id: string | null): string => orNotFound(id)

export const addPetTask = async (
  context: PetsServiceContext,
  petId: string | null,
  input: unknown,
) => {
  const pet = await requirePet(context, petId)
  const task = parseOrThrow(taskInputSchema, input)
  return createTask(context.db, {
    ownerId: context.ownerId,
    entityType: PET_ENTITY_TYPE,
    entityId: pet.id,
    ...task,
  })
}

export const listPetTasks = (context: PetsServiceContext, petId: string, includeDone: boolean) =>
  listTasks(context.db, {
    ownerId: context.ownerId,
    entityType: PET_ENTITY_TYPE,
    entityId: petId,
    includeDone,
  })

export const updatePetTask = async (
  context: PetsServiceContext,
  id: string | null,
  input: unknown,
) => {
  const task = parseOrThrow(taskInputSchema, input)
  return orNotFound(
    await updateTask(context.db, {
      ownerId: context.ownerId,
      id: requireId(id),
      title: task.title,
      note: task.note ?? null,
      dueOn: task.dueOn ?? null,
    }),
  )
}

export const setPetTaskDone = async (
  context: PetsServiceContext,
  id: string | null,
  done: boolean,
) =>
  orNotFound(
    await setTaskCompleted(context.db, {
      ownerId: context.ownerId,
      id: requireId(id),
      isCompleted: done,
    }),
  )

export const deletePetTask = async (context: PetsServiceContext, id: string | null) => {
  orNotFound(await deleteTask(context.db, { ownerId: context.ownerId, id: requireId(id) }))
  return true
}
