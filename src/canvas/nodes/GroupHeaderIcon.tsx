import { ThemeIcon } from '@mantine/core'
import { getAssetUrl } from '../../assets-runtime/assetStore'
import { GroupTypeIcon } from './GroupTypeIcon'

interface GroupHeaderIconProps {
  icon?: string
  logoAssetId?: string
  size: number
}

/** Renders a group's uploaded logo when set, falling back to its picked icon. */
export default function GroupHeaderIcon({ icon, logoAssetId, size }: GroupHeaderIconProps) {
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
      <GroupTypeIcon icon={icon} size={Math.round(size * 0.64)} />
    </ThemeIcon>
  )
}
