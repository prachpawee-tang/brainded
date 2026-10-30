import { Button, IconButton, Text } from '@brain/ui'
import { launchImageLibraryAsync } from 'expo-image-picker'
import { ImagePlus, X } from 'lucide-react-native'
import { useState } from 'react'
import { Image, View } from 'react-native'
import { usePetsServices } from '../lib/pets-services'
import { usePetLabels } from '../lib/use-pet-labels'

const PHOTO_QUALITY = 0.7
const MAX_PHOTOS = 10

type Uploaded = { key: string; uri: string }

/** Add or remove photos (one pick at a time); reports the storage keys. `initial` = already saved. */
export const PhotoStrip = ({
  label,
  initial = [],
  onChange,
}: {
  label: string
  initial?: readonly Uploaded[]
  onChange: (keys: string[]) => void
}) => {
  const { t } = usePetLabels()
  const { uploadPhoto } = usePetsServices()
  const [photos, setPhotos] = useState<Uploaded[]>(() => [...initial])
  const [isUploading, setIsUploading] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const update = (next: Uploaded[]) => {
    setPhotos(next)
    onChange(next.map((p) => p.key))
  }

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
      update([...photos, { key, uri: asset.uri }])
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
          <View key={photo.key}>
            <Image
              accessibilityLabel={t('labs.photo', { index: index + 1 })}
              source={{ uri: photo.uri }}
              className="size-20 rounded-lg bg-surface-muted"
            />
            <IconButton
              icon={X}
              variant="soft"
              label={t('labs.removePhoto', { index: index + 1 })}
              onPress={() => update(photos.filter((p) => p.key !== photo.key))}
              className="absolute -right-2 -top-2"
            />
          </View>
        ))}
        {photos.length < MAX_PHOTOS ? (
          <Button
            variant="secondary"
            size="sm"
            icon={ImagePlus}
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
