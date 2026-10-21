import { useState } from 'react'
import type { Appointment } from './types'

export const useAppointmentSheet = () => {
  const [state, setState] = useState<{ visible: boolean; appointment?: Appointment }>({
    visible: false,
  })
  return {
    ...state,
    openNew: () => setState({ visible: true }),
    openEdit: (appointment: Appointment) => setState({ visible: true, appointment }),
    close: () => setState((s) => ({ ...s, visible: false })),
  }
}
