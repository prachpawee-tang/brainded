import { cn } from '@brain/ui'
import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TOP_GAP = 24
const BOTTOM_GAP = 32

type ScreenLayoutProps = {
  children: ReactNode
  /** Center content vertically (auth screens). */
  centered?: boolean
}

/** Scrollable, keyboard-aware, safe-area-padded screen with a readable max width on web. */
export const ScreenLayout = ({ children, centered = false }: ScreenLayoutProps) => {
  const insets = useSafeAreaInsets()
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerClassName={cn(
          'w-full max-w-xl self-center gap-8 px-6',
          centered && 'flex-grow justify-center',
        )}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_GAP,
          paddingBottom: insets.bottom + BOTTOM_GAP,
        }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
