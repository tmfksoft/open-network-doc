import type { ReactNode } from 'react'
import { Stack, Text, ThemeIcon } from '@mantine/core'
import { NodeCard } from './NodeCard'
import { getAssetUrl } from '../../assets-runtime/assetStore'
import type { DocNode } from '../../fileformat/types'

interface NetworkNodeShellProps {
  node: DocNode
  icon: ReactNode
  label: string
  subtext?: string
  selected?: boolean
  highlighted?: boolean
  accentColor?: string
  /** When set, replaces the icon with this uploaded logo, height-capped but free to size its own width so a wide logo isn't squashed into a square. */
  logoAssetId?: string
}

/** Shared canvas presentation for connectable network nodes: icon centered above a label, subtext below. */
export function NetworkNodeShell({
  node,
  icon,
  label,
  subtext,
  selected,
  highlighted,
  accentColor,
  logoAssetId,
}: NetworkNodeShellProps) {
  const logoUrl = logoAssetId ? getAssetUrl(logoAssetId) : undefined

  return (
    <NodeCard node={node} selected={selected} highlighted={highlighted} accentColor={accentColor}>
      <Stack gap={4} align="center" justify="center" h="100%">
        {logoUrl ? (
          <img src={logoUrl} alt="" style={{ height: 40, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
        ) : (
          <ThemeIcon variant="light" color={accentColor} size={40} radius="md">
            {icon}
          </ThemeIcon>
        )}
        <Text fw={600} size="sm" ta="center" truncate style={{ width: '100%' }}>
          {label}
        </Text>
        {subtext && (
          <Text size="xs" c="dimmed" ta="center">
            {subtext}
          </Text>
        )}
      </Stack>
    </NodeCard>
  )
}
