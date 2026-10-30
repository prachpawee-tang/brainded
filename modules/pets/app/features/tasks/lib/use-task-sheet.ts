import { useState } from 'react'
import type { Task } from './types'

export const useTaskSheet = () => {
  const [state, setState] = useState<{ visible: boolean; task?: Task }>({ visible: false })
  return {
    ...state,
    openNew: () => setState({ visible: true }),
    openEdit: (task: Task) => setState({ visible: true, task }),
    close: () => setState((s) => ({ ...s, visible: false })),
  }
}
