import { NodeResizer, type NodeProps } from '@xyflow/react'
import { Group, Text } from '@mantine/core'
import type { GroupHeaderDocNode } from '../../fileformat/types'
import GroupHeaderIcon from './GroupHeaderIcon'
import { GROUP_HEADER_HEIGHT, GROUP_MIN_WIDTH, GROUP_MIN_HEIGHT } from './groupLayoutConstants'
import NodeHoverCard from '../popovers/NodeHoverCard'
import { NodeHandles } from './NodeHandles'

export default function GroupHeaderNode({ data, selected }: NodeProps) {
  const { docNode } = data as unknown as { docNode: GroupHeaderDocNode }

  return (
    <NodeHoverCard node={docNode}>
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 12,
          border: `1px solid ${selected ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-default-border)'}`,
          background: 'var(--mantine-color-dark-6)',
          opacity: 0.9,
        }}
      >
        {!docNode.data.hideHandles && <NodeHandles width={docNode.width} height={docNode.height} />}
        <NodeResizer
          isVisible={selected}
          minWidth={GROUP_MIN_WIDTH}
          minHeight={GROUP_MIN_HEIGHT}
          lineStyle={{ borderColor: 'var(--mantine-color-blue-6)' }}
          handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
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
