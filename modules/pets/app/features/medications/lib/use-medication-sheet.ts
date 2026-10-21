import { useState } from 'react'
import type { Medication } from '../components/medication-rows'

/** Open/close state for the medication sheet (new = no medication). */
export const useMedicationSheet = () => {
  const [state, setState] = useState<{ visible: boolean; medication?: Medication }>({
    visible: false,
  })
  return {
    ...state,
    openNew: () => setState({ visible: true }),
    openEdit: (medication: Medication) => setState({ visible: true, medication }),
    close: () => setState((s) => ({ ...s, visible: false })),
  }
}
