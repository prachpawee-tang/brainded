import { Button, Text } from '@brain/ui'
import { launchImageLibraryAsync } from 'expo-image-picker'
import { useState } from 'react'
import { Image, View } from 'react-native'
import { usePetsServices } from '../lib/pets-services'
import { usePetLabels } from '../lib/use-pet-labels'

const PHOTO_QUALITY = 0.7
const MAX_PHOTOS = 10

type Uploaded = { key: string; uri: string }

/** Add several photos (one pick at a time); reports uploaded storage keys. */
export const PhotoStrip = ({
  label,
  onChange,
}: {
  label: string
  onChange: (keys: string[]) => void
}) => {
  const { t } = usePetLabels()
  const { uploadPhoto } = usePetsServices()
  const [photos, setPhotos] = useState<Uploaded[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const add = async () => {
    const result = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: PHOTO_QUALITY })
    const asset = result.canceled ? null : result.assets[0]
    if (!asset) return
    setIsUploading(true)
    setHasFailed(false)
    try {
      const key = await uploadPhoto({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
      })
      const next = [...photos, { key, uri: asset.uri }]
      setPhotos(next)
      onChange(next.map((p) => p.key))
    } catch {
      setHasFailed(true)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <View className="gap-2">
      <Text variant="caption" tone="muted" className="font-sans-medium">
        {label}
      </Text>
      <View className="flex-row flex-wrap items-center gap-3">
        {photos.map((photo, index) => (
          <Image
            key={photo.key}
            accessibilityLabel={t('labs.photo', { index: index + 1 })}
            source={{ uri: photo.uri }}
            className="size-20 rounded-lg bg-surface-muted"
          />
        ))}
        {photos.length < MAX_PHOTOS ? (
          <Button
            variant="secondary"
            size="sm"
            label={t('labs.addPhoto')}
            loading={isUploading}
            onPress={add}
          />
        ) : null}
      </View>
      {hasFailed ? (
        <Text accessibilityRole="alert" variant="caption" tone="danger">
          {t('errors.UPLOAD_FAILED')}
        </Text>
      ) : null}
    </View>
  )
}
