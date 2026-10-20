import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cn } from '../../lib/cn'

const TOP_GAP = 24
const BOTTOM_GAP = 32
const FOOTER_GAP = 12

export type ScreenLayoutProps = {
  children: ReactNode
  /** Pinned below the scroll area (e.g. quick actions), padded for the home indicator. */
  footer?: ReactNode
  /** Center content vertically (auth screens). */
  centered?: boolean
}

/** Scrollable, keyboard-aware, safe-area-padded screen with a readable max width on web. */
export const ScreenLayout = ({ children, footer, centered = false }: ScreenLayoutProps) => {
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
      {footer ? (
        <View
          className="w-full max-w-xl self-center border-t border-border bg-bg px-6 pt-3"
          style={{ paddingBottom: insets.bottom + FOOTER_GAP }}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  )
}
