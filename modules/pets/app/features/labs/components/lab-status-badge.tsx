import { Badge } from '@brain/ui'
import { usePetLabels } from '../../../lib/use-pet-labels'

/** Abnormal count as text (never color alone). */
export const LabStatusBadge = ({ abnormalCount }: { abnormalCount: number }) => {
  const { t } = usePetLabels()
  return abnormalCount > 0 ? (
    <Badge tone="warning" label={t('labs.abnormal', { count: abnormalCount })} />
  ) : (
    <Badge tone="success" label={t('labs.allNormal')} />
  )
}
