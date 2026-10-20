import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native'
import { Button } from '../../atoms/button/button'
import { Text } from '../../atoms/text/text'

export type SheetProps = {
  visible: boolean
  /** Already-translated title, announced as a header. */
  title: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}

/** Bottom sheet for short, focused tasks (log a weight, add a note). */
export const Sheet = ({ visible, title, closeLabel, onClose, children }: SheetProps) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable accessibilityLabel={closeLabel} className="flex-1 bg-black/30" onPress={onClose} />
      <View className="max-h-[85%] w-full max-w-xl self-center rounded-t-xl bg-bg pb-8">
        <View className="items-center pt-3">
          <View className="h-1 w-10 rounded-full bg-border" />
        </View>
        <View className="flex-row items-center justify-between px-6 pt-3">
          <Text variant="title" className="text-xl leading-8">
            {title}
          </Text>
          <Button variant="ghost" size="sm" label={closeLabel} onPress={onClose} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 px-6 pt-4">
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>
)
