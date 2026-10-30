import { useEffect, useRef, useState } from 'react'
import { useToggleTask } from './use-toggle-task'

/** How long a ticked to-do stays (struck through) before it leaves a list of open ones. */
export const LINGER_MS = 1500

type TaskLike = { id: string; completedAt?: string | null }
type Lingering<T> = { task: T; index: number }

/**
 * Toggle for lists that hide done to-dos. A ticked one stays in place, checked, for a moment,
 * so the tick is seen before the row goes.
 */
export const useLingeringToggle = <T extends TaskLike>(tasks: readonly T[]) => {
  const toggle = useToggleTask()
  const [lingering, setLingering] = useState<Record<string, Lingering<T>>>({})
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending.values()) clearTimeout(timer)
    }
  }, [])

  const forget = (id: string) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setLingering(({ [id]: _, ...rest }) => rest)
  }

  const onToggle = (task: T, done: boolean) => {
    toggle(task.id, done)
    if (!done) return forget(task.id)
    const index = Math.max(
      0,
      tasks.findIndex((t) => t.id === task.id),
    )
    setLingering((l) => ({
      ...l,
      [task.id]: { task: { ...task, completedAt: new Date().toISOString() }, index },
    }))
    clearTimeout(timers.current.get(task.id))
    timers.current.set(
      task.id,
      setTimeout(() => forget(task.id), LINGER_MS),
    )
  }

  const rows: T[] = tasks.map((t) => lingering[t.id]?.task ?? t)
  const extra = Object.values(lingering)
    .filter(({ task }) => !tasks.some((t) => t.id === task.id))
    .sort((a, b) => a.index - b.index)
  for (const { task, index } of extra) rows.splice(Math.min(index, rows.length), 0, task)

  return { rows, onToggle }
}
