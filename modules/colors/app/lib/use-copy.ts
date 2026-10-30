import { setStringAsync } from 'expo-clipboard'
import { useEffect, useState } from 'react'

const COPIED_MS = 1500

/** Copy text; `copiedKey` names what was just copied, for a short "Copied" confirmation. */
export const useCopy = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    if (!copiedKey) return
    const timer = setTimeout(() => setCopiedKey(null), COPIED_MS)
    return () => clearTimeout(timer)
  }, [copiedKey])

  const copy = async (key: string, text: string) => {
    if (await setStringAsync(text)) setCopiedKey(key)
  }
  return { copy, copiedKey }
}
