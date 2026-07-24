import type { NodeProps } from '@xyflow/react'
import { Box, Group, Text } from '@mantine/core'
import type { MarkdownNoteDocNode } from '../../fileformat/types'
import { NodeCard } from './NodeCard'
import { MARKDOWN_NOTE_ICON } from './nodeTypeMeta'
import MarkdownRenderer from '../../markdown/MarkdownRenderer'

export const MARKDOWN_NOTE_DEFAULT_WIDTH = 260
export const MARKDOWN_NOTE_DEFAULT_HEIGHT = 180

/** Pure information display: renders its description as markdown, no connection handles. */
export default function MarkdownNoteNode({ data, selected }: NodeProps) {
  const { docNode, highlighted } = data as unknown as { docNode: MarkdownNoteDocNode; highlighted?: boolean }
  const Icon = MARKDOWN_NOTE_ICON

  return (
    <NodeCard node={docNode} selected={selected} highlighted={highlighted} hideHandles>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Group
          gap={6}
          wrap="nowrap"
          pb={6}
          mb={6}
          style={{ flexShrink: 0, borderBottom: '1px solid var(--mantine-color-default-border)' }}
        >
          <Icon size={16} />
          <Text size="sm" fw={600} truncate>
            {docNode.label}
          </Text>
        </Group>
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {docNode.description ? (
            <MarkdownRenderer content={docNode.description} />
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              Empty note — click to add content
            </Text>
          )}
        </Box>
      </div>
    </NodeCard>
  )
}
