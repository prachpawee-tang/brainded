/**
 * Core primitive: a reminder the app shell can schedule as a local notification.
 * Modules produce these from their own data; the shell owns delivery (CLAUDE.md §4).
 */
export type ReminderItem = {
  /** Stable across re-plans (e.g. `pets.dose:<med>:<day>:<time>`). */
  id: string
  /** When to notify. */
  at: Date
  /** Already-translated notification title and body. */
  title: string
  body: string
  /** In-app route opened when the notification is tapped. */
  route: string
}

/** Device-level switches; each module maps its own kinds onto these. */
export type ReminderSettings = {
  isEnabled: boolean
  doses: boolean
  appointments: boolean
  tasks: boolean
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  isEnabled: false,
  doses: true,
  appointments: true,
  tasks: true,
}
