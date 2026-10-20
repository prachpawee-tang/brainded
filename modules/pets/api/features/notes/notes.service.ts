import {
  decodeTimelineCursor,
  encodeTimelineCursor,
  listTimelineEvents,
  recordTimelineEvent,
} from '@brain/core/server'
import { type PetNoteType, petNoteInputSchema } from '../../../shared/validation'
import { type PetsServiceContext, pageSize, parseOrThrow } from '../../lib/context'
import { requirePet } from '../profile/profile.service'
import { PET_ENTITY_TYPE, WEIGHT_EVENT_KIND } from '../weight/weight.service'

const NOTE_KIND_PREFIX = 'pets.note.'

export const noteKind = (type: PetNoteType) => `${NOTE_KIND_PREFIX}${type.toLowerCase()}`

/** Core kind string → GraphQL `PetTimelineKind`. Unknown kinds surface as NOTE_GENERAL. */
const FIXED_KINDS: Record<string, string> = {
  [WEIGHT_EVENT_KIND]: 'WEIGHT',
  'pets.lab_result': 'LAB_RESULT',
  'pets.medication.started': 'MEDICATION_STARTED',
  'pets.appointment.done': 'APPOINTMENT_DONE',
}

export const toTimelineKind = (kind: string): string => {
  const fixed = FIXED_KINDS[kind]
  if (fixed) return fixed
  if (kind.startsWith(NOTE_KIND_PREFIX))
    return `NOTE_${kind.slice(NOTE_KIND_PREFIX.length).toUpperCase()}`
  return 'NOTE_GENERAL'
}

export const addPetNote = async (
  context: PetsServiceContext,
  petId: string | null,
  input: unknown,
) => {
  const pet = await requirePet(context, petId)
  const note = parseOrThrow(petNoteInputSchema, input)
  await recordTimelineEvent(context.db, {
    ownerId: context.ownerId,
    entityType: PET_ENTITY_TYPE,
    entityId: pet.id,
    kind: noteKind(note.type),
    occurredOn: note.occurredOn,
    body: note.body,
  })
  return pet
}

export const listPetTimeline = async (
  context: PetsServiceContext,
  petId: string,
  { first, after }: { first?: number | null; after?: string | null },
) => {
  let cursor: ReturnType<typeof decodeTimelineCursor> | undefined
  try {
    cursor = after ? decodeTimelineCursor(after) : undefined
  } catch {
    cursor = undefined
  }
  const { events, hasNextPage } = await listTimelineEvents(context.db, {
    ownerId: context.ownerId,
    entityType: PET_ENTITY_TYPE,
    entityId: petId,
    limit: pageSize(first),
    after: cursor,
  })
  const edges = events.map((event) => ({ node: event, cursor: encodeTimelineCursor(event) }))
  return {
    edges,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: Boolean(cursor),
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges.at(-1)?.cursor ?? null,
    },
  }
}
