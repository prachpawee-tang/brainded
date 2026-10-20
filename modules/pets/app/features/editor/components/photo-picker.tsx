import { Avatar, Button, Text } from '@brain/ui'
import { launchImageLibraryAsync } from 'expo-image-picker'
import { useState } from 'react'
import { View } from 'react-native'
import { usePetsAccent } from '../../../lib/accent'
import { usePetsServices } from '../../../lib/pets-services'
import { usePetLabels } from '../../../lib/use-pet-labels'

const PHOTO_QUALITY = 0.7

type Props = {
  name: string
  fallback: string
  /** Current remote photo (edit mode). */
  imageUrl: string | null | undefined
  onUploaded: (photoKey: string) => void
}

export const PhotoPicker = ({ name, fallback, imageUrl, onUploaded }: Props) => {
  const { t } = usePetLabels()
  const accent = usePetsAccent()
  const { uploadPhoto } = usePetsServices()
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const pick = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: PHOTO_QUALITY,
    })
    const asset = result.canceled ? null : result.assets[0]
    if (!asset) return
    setPreview(asset.uri)
    setHasFailed(false)
    setIsUploading(true)
    try {
      onUploaded(
        await uploadPhoto({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName }),
      )
    } catch {
      setHasFailed(true)
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const shown = preview ?? imageUrl ?? null

  return (
    <View className="items-center gap-3">
      <Avatar
        label={name || t('editor.photo')}
        imageUrl={shown}
        fallback={fallback}
        accentColor={accent}
        size="xl"
      />
      <Button
        variant="secondary"
        size="sm"
        label={shown ? t('editor.changePhoto') : t('editor.choosePhoto')}
        loading={isUploading}
        onPress={pick}
      />
      {hasFailed ? (
        <Text accessibilityRole="alert" variant="caption" tone="danger">
          {t('errors.UPLOAD_FAILED')}
        </Text>
      ) : null}
    </View>
  )
}
