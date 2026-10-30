import { type Href, router } from 'expo-router'

/**
 * Back that never dead-ends. On web a reload or deep link leaves no history, and a bare
 * `router.back()` throws "GO_BACK was not handled". Then we go to the screen's parent instead.
 */
export const goBack = (fallback: Href) => {
  if (router.canGoBack()) router.back()
  else router.replace(fallback)
}
