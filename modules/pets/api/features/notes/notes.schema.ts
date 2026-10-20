import type { TimelineEvent } from '@brain/core/server'
import { type Builder, NotFoundError, UnauthenticatedError, ValidationError } from '@brain/graphql'
import { PET_NOTE_TYPES } from '../../../shared/validation'
import { petIdFromGlobalId, toServiceContext } from '../../lib/context'
import type { PetRef } from '../profile/profile.schema'
import { addPetNote, listPetTimeline, toTimelineKind } from './notes.service'

const TIMELINE_KINDS = ['WEIGHT', ...PET_NOTE_TYPES.map((type) => `NOTE_${type}`)] as const

export const registerNotes = (builder: Builder, Pet: PetRef) => {
  const PetNoteType = builder.enumType('PetNoteType', { values: PET_NOTE_TYPES })
  const PetTimelineKind = builder.enumType('PetTimelineKind', { values: TIMELINE_KINDS })

  const PetTimelineEvent = builder.objectRef<TimelineEvent>('PetTimelineEvent').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      kind: t.field({
        type: PetTimelineKind,
        resolve: (event) => toTimelineKind(event.kind) as never,
      }),
      occurredOn: t.field({ type: 'LocalDate', resolve: (event) => event.occurredOn }),
      body: t.exposeString('body', { nullable: true }),
      weightGrams: t.int({
        nullable: true,
        resolve: (event) =>
          typeof event.data.weightGrams === 'number' ? event.data.weightGrams : null,
      }),
    }),
  })

  builder.objectField(Pet, 'timeline', (t) =>
    t.connection({
      type: PetTimelineEvent,
      resolve: (pet, args, context) => listPetTimeline(toServiceContext(context), pet.id, args),
    }),
  )

  const AddPetNoteInput = builder.inputType('AddPetNoteInput', {
    fields: (t) => ({
      petId: t.id({ required: true }),
      type: t.field({ type: PetNoteType, required: true }),
      body: t.string({ required: true }),
      occurredOn: t.field({ type: 'LocalDate', required: true }),
    }),
  })

  builder.mutationField('addPetNote', (t) =>
    t.field({
      type: Pet,
      errors: { types: [UnauthenticatedError, ValidationError, NotFoundError] },
      args: { input: t.arg({ type: AddPetNoteInput, required: true }) },
      resolve: (_root, { input: { petId, ...note } }, context) =>
        addPetNote(toServiceContext(context), petIdFromGlobalId(String(petId)), note),
    }),
  )
}
