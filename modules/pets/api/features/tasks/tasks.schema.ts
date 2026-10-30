import type { Task } from '@brain/core/server'
import { type Builder, NotFoundError, UnauthenticatedError, ValidationError } from '@brain/graphql'
import { asUuid, petIdFromGlobalId, toServiceContext } from '../../lib/context'
import type { PetRef } from '../profile/profile.schema'
import {
  addPetTask,
  deletePetTask,
  listPetTasks,
  setPetTaskDone,
  updatePetTask,
} from './tasks.service'

export const registerTasks = (builder: Builder, Pet: PetRef) => {
  const PetTask = builder.objectRef<Task>('PetTask').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      title: t.exposeString('title'),
      note: t.exposeString('note', { nullable: true }),
      dueOn: t.field({ type: 'LocalDate', nullable: true, resolve: (task) => task.dueOn }),
      completedAt: t.field({
        type: 'DateTime',
        nullable: true,
        resolve: (task) => task.completedAt,
      }),
    }),
  })

  builder.objectField(Pet, 'tasks', (t) =>
    t.field({
      type: [PetTask],
      args: { includeDone: t.arg.boolean() },
      resolve: (pet, { includeDone }, context) =>
        listPetTasks(toServiceContext(context), pet.id, includeDone ?? false),
    }),
  )

  const AddPetTaskInput = builder.inputType('AddPetTaskInput', {
    fields: (t) => ({
      petId: t.id({ required: true }),
      title: t.string({ required: true }),
      note: t.string(),
      dueOn: t.field({ type: 'LocalDate' }),
    }),
  })
  const UpdatePetTaskInput = builder.inputType('UpdatePetTaskInput', {
    fields: (t) => ({
      id: t.id({ required: true }),
      title: t.string({ required: true }),
      note: t.string(),
      dueOn: t.field({ type: 'LocalDate' }),
    }),
  })
  const SetPetTaskDoneInput = builder.inputType('SetPetTaskDoneInput', {
    fields: (t) => ({ id: t.id({ required: true }), done: t.boolean({ required: true }) }),
  })
  const DeletePetTaskInput = builder.inputType('DeletePetTaskInput', {
    fields: (t) => ({ id: t.id({ required: true }) }),
  })

  const errors = { types: [UnauthenticatedError, ValidationError, NotFoundError] }

  builder.mutationField('addPetTask', (t) =>
    t.field({
      type: PetTask,
      errors,
      args: { input: t.arg({ type: AddPetTaskInput, required: true }) },
      resolve: (_root, { input: { petId, ...task } }, context) =>
        addPetTask(toServiceContext(context), petIdFromGlobalId(String(petId)), task),
    }),
  )

  builder.mutationField('updatePetTask', (t) =>
    t.field({
      type: PetTask,
      errors,
      args: { input: t.arg({ type: UpdatePetTaskInput, required: true }) },
      resolve: (_root, { input: { id, ...task } }, context) =>
        updatePetTask(toServiceContext(context), asUuid(id), task),
    }),
  )

  builder.mutationField('setPetTaskDone', (t) =>
    t.field({
      type: PetTask,
      errors: { types: [UnauthenticatedError, NotFoundError] },
      args: { input: t.arg({ type: SetPetTaskDoneInput, required: true }) },
      resolve: (_root, { input }, context) =>
        setPetTaskDone(toServiceContext(context), asUuid(input.id), input.done),
    }),
  )

  builder.mutationField('deletePetTask', (t) =>
    t.field({
      type: 'Boolean',
      errors: { types: [UnauthenticatedError, NotFoundError] },
      args: { input: t.arg({ type: DeletePetTaskInput, required: true }) },
      resolve: (_root, { input }, context) =>
        deletePetTask(toServiceContext(context), asUuid(input.id)),
    }),
  )
}
