import { ThemeIcon } from '@mantine/core'
import { getAssetUrl } from '../../assets-runtime/assetStore'
import { DeviceTypeIcon } from './deviceIcons'
import type { DeviceType } from '../../fileformat/types'

interface DeviceIconProps {
  deviceType?: DeviceType
  logoAssetId?: string
  size: number
}

/** Square inspector-preview swatch: a device's uploaded logo when set, falling back to its type icon. */
export default function DeviceIcon({ deviceType, logoAssetId, size }: DeviceIconProps) {
  const logoUrl = logoAssetId ? getAssetUrl(logoAssetId) : undefined

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: 4, flexShrink: 0 }}
      />
    )
  }

  return (
    <ThemeIcon variant="light" size={size} radius="sm">
      <DeviceTypeIcon deviceType={deviceType} size={Math.round(size * 0.64)} />
    </ThemeIcon>
  )
}
