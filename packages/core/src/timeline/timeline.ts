import { and, type Database, desc, eq, notDeleted, sql, timelineEvents } from '@brain/db'

export type TimelineEvent = typeof timelineEvents.$inferSelect

export type RecordTimelineEventInput = {
  ownerId: string
  /** `<module>.<entity>`, e.g. `pets.pet`. */
  entityType: string
  entityId: string
  /** Module-defined, e.g. `pets.weight`. */
  kind: string
  /** YYYY-MM-DD */
  occurredOn: string
  body?: string | null
  data?: Record<string, unknown>
}

export type TimelineCursor = { occurredOn: string; id: string }

const CURSOR_SEPARATOR = '|'

export const encodeTimelineCursor = ({ occurredOn, id }: TimelineCursor): string =>
  Buffer.from(`${occurredOn}${CURSOR_SEPARATOR}${id}`).toString('base64url')

export const decodeTimelineCursor = (cursor: string): TimelineCursor => {
  const [occurredOn, id] = Buffer.from(cursor, 'base64url').toString().split(CURSOR_SEPARATOR)
  if (!occurredOn || !id) throw new Error('Invalid cursor')
  return { occurredOn, id }
}

export const recordTimelineEvent = async (
  db: Database,
  input: RecordTimelineEventInput,
): Promise<TimelineEvent> => {
  const [event] = await db
    .insert(timelineEvents)
    .values({ ...input, body: input.body ?? null, data: input.data ?? {} })
    .returning()
  if (!event) throw new Error('Failed to record timeline event')
  return event
}

/** Newest first (occurred_on, then id — UUIDv7 ids are time-ordered). Keyset pagination. */
export const listTimelineEvents = async (
  db: Database,
  {
    ownerId,
    entityType,
    entityId,
    limit,
    after,
  }: {
    ownerId: string
    entityType: string
    entityId: string
    limit: number
    after?: TimelineCursor | undefined
  },
) => {
  const rows = await db
    .select()
    .from(timelineEvents)
    .where(
      and(
        eq(timelineEvents.ownerId, ownerId),
        eq(timelineEvents.entityType, entityType),
        eq(timelineEvents.entityId, entityId),
        notDeleted(timelineEvents),
        after
          ? sql`(${timelineEvents.occurredOn}, ${timelineEvents.id}) < (${after.occurredOn}, ${after.id})`
          : undefined,
      ),
    )
    .orderBy(desc(timelineEvents.occurredOn), desc(timelineEvents.id))
    .limit(limit + 1)
  return { events: rows.slice(0, limit), hasNextPage: rows.length > limit }
}
