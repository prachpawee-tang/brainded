import { Alert, Platform } from 'react-native'

/** Destructive-action confirmation. Web: `window.confirm`; native: a two-button alert. */
export const confirmAction = (
  message: string,
  labels: { confirm: string; cancel: string },
): Promise<boolean> => {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(message))
  return new Promise((resolve) =>
    Alert.alert('', message, [
      { text: labels.cancel, style: 'cancel', onPress: () => resolve(false) },
      { text: labels.confirm, style: 'destructive', onPress: () => resolve(true) },
    ]),
  )
}
