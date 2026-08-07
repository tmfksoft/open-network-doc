import type { ReactNode } from 'react'
import { Group, Stack, Text, ThemeIcon } from '@mantine/core'
import { NodeCard, NODE_CARD_DEFAULT_HEIGHT } from './NodeCard'
import { getAssetUrl } from '../../assets-runtime/assetStore'
import type { DocNode } from '../../fileformat/types'

/** Below this node height, the icon-above-label-above-subtext stack can no
 * longer fit — switch to a compact icon-left/label-right row instead of
 * letting the label get squeezed out by the flex layout. */
const COMPACT_LAYOUT_HEIGHT = 95

interface NetworkNodeShellProps {
  node: DocNode
  icon: ReactNode
  label: string
  subtext?: string
  selected?: boolean
  highlighted?: boolean
  accentColor?: string
  backgroundColor?: string
  borderColor?: string
  /** When set, replaces the icon with this uploaded logo, height-capped but free to size its own width so a wide logo isn't squashed into a square. */
  logoAssetId?: string
  handlesVisible?: boolean
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
  backgroundColor,
  borderColor,
  logoAssetId,
  handlesVisible,
}: NetworkNodeShellProps) {
  const logoUrl = logoAssetId ? getAssetUrl(logoAssetId) : undefined
  const compact = (node.height ?? NODE_CARD_DEFAULT_HEIGHT) < COMPACT_LAYOUT_HEIGHT

  return (
    <NodeCard
      node={node}
      selected={selected}
      highlighted={highlighted}
      accentColor={accentColor}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      handlesVisible={handlesVisible}
    >
      {compact ? (
        <Group gap={8} wrap="nowrap" align="center" h="100%">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              style={{ height: 24, width: 'auto', maxWidth: 32, objectFit: 'contain', flexShrink: 0 }}
            />
          ) : (
            <ThemeIcon variant="light" color={accentColor} size={26} radius="md" style={{ flexShrink: 0 }}>
              {icon}
            </ThemeIcon>
          )}
          <Text fw={600} size="sm" truncate style={{ flex: 1, minWidth: 0 }}>
            {label}
          </Text>
        </Group>
      ) : (
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
      )}
    </NodeCard>
  )
}
