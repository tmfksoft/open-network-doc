import { NodeResizer, type NodeProps } from '@xyflow/react'
import { Group, Text } from '@mantine/core'
import type { GroupHeaderDocNode } from '../../fileformat/types'
import GroupHeaderIcon from './GroupHeaderIcon'
import { GROUP_HEADER_HEIGHT, GROUP_MIN_WIDTH, GROUP_MIN_HEIGHT } from './groupLayoutConstants'
import NodeHoverCard from '../popovers/NodeHoverCard'
import { NodeHandles } from './NodeHandles'

/** Mantine's dark.6 (the previous default fill) pre-converted to 50% alpha. */
const DEFAULT_GROUP_BACKGROUND = 'rgba(37, 38, 43, 0.5)'

/** Background is always rendered at 50% opacity regardless of the chosen
 * colour, so groups stay visually see-through without dimming their
 * border/icon/label the way a whole-element CSS opacity would. */
function groupBackground(hex: string | undefined): string {
  if (!hex) return DEFAULT_GROUP_BACKGROUND
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, 0.5)`
}

export default function GroupHeaderNode({ data, selected }: NodeProps) {
  const { docNode, handlesVisible } = data as unknown as { docNode: GroupHeaderDocNode; handlesVisible?: boolean }

  return (
    <NodeHoverCard node={docNode}>
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 12,
          border: `1px solid ${selected ? 'var(--mantine-color-blue-6)' : (docNode.data.borderColor ?? 'var(--mantine-color-default-border)')}`,
          background: groupBackground(docNode.data.backgroundColor),
        }}
      >
        <NodeResizer
          isVisible={selected}
          minWidth={GROUP_MIN_WIDTH}
          minHeight={GROUP_MIN_HEIGHT}
          lineStyle={{ borderColor: 'var(--mantine-color-blue-6)' }}
          handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
        />
        {/* Rendered after NodeResizer so its handles paint (and hit-test)
            above the resizer's full-edge drag lines — otherwise the resize
            line swallows every click along the border and the connection
            handles become unreachable. Always mounted (never gated on
            showHandles) so a path already drawn to this group's border
            keeps resolving even if the user later unchecks "Show
            connection handles" — only the visual/interactive state should
            ever depend on that setting. */}
        <NodeHandles
          width={docNode.width}
          height={docNode.height}
          visible={Boolean(docNode.data.showHandles) && handlesVisible}
        />
        <Group gap={6} wrap="nowrap" px={10} style={{ height: GROUP_HEADER_HEIGHT }}>
          <GroupHeaderIcon icon={docNode.data.icon} logoAssetId={docNode.data.logoAssetId} size={22} />
          <Text size="sm" fw={600} truncate>
            {docNode.label}
          </Text>
        </Group>
      </div>
    </NodeHoverCard>
  )
}
