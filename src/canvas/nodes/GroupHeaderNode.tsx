import { NodeResizer, type NodeProps } from '@xyflow/react'
import { Group, Text, ThemeIcon } from '@mantine/core'
import type { GroupHeaderData } from '../../fileformat/types'
import { GroupTypeIcon } from './GroupTypeIcon'
import { GROUP_HEADER_HEIGHT, GROUP_MIN_WIDTH, GROUP_MIN_HEIGHT } from './groupLayoutConstants'

export default function GroupHeaderNode({ data, selected }: NodeProps) {
  const group = data as unknown as GroupHeaderData & { label: string }

  return (
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
      <NodeResizer
        isVisible={selected}
        minWidth={GROUP_MIN_WIDTH}
        minHeight={GROUP_MIN_HEIGHT}
        lineStyle={{ borderColor: 'var(--mantine-color-blue-6)' }}
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />
      <Group gap={6} wrap="nowrap" px={10} style={{ height: GROUP_HEADER_HEIGHT }}>
        <ThemeIcon variant="light" size={22} radius="sm">
          <GroupTypeIcon icon={group.icon} size={14} />
        </ThemeIcon>
        <Text size="sm" fw={600} truncate>
          {group.label}
        </Text>
      </Group>
    </div>
  )
}
