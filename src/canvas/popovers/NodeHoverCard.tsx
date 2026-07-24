import type { ReactNode } from 'react'
import { HoverCard, Stack, Group, Text } from '@mantine/core'
import { useConnection } from '@xyflow/react'
import type { DocNode } from '../../fileformat/types'
import { getNodeSummary } from '../../store/nodeSummary'

interface NodeHoverCardProps {
  node: DocNode
  children: ReactNode
}

/** Lightweight hover summary shown for any canvas node, sourced from the same
 * data as the click-to-inspect sidebar so the two views never drift apart. */
export default function NodeHoverCard({ node, children }: NodeHoverCardProps) {
  // Suppress the popover while the user is mid-drag drawing a new connection,
  // so it doesn't pop up over the node they're about to connect to.
  const { inProgress } = useConnection()
  const summary = getNodeSummary(node)
  const descriptionSnippet = node.description?.trim().split('\n')[0]?.slice(0, 140)

  return (
    <HoverCard openDelay={300} closeDelay={100} disabled={inProgress} withinPortal shadow="md" position="right">
      <HoverCard.Target>{children}</HoverCard.Target>
      <HoverCard.Dropdown className="nodrag nopan" maw={260}>
        <Stack gap={4}>
          <Text fw={600} size="sm">
            {node.label}
          </Text>
          {summary.map((line) => (
            <Group key={line.label} gap="xs" justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">
                {line.label}
              </Text>
              <Text size="xs" ta="right" style={{ wordBreak: 'break-word' }}>
                {line.value}
              </Text>
            </Group>
          ))}
          {descriptionSnippet ? (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {descriptionSnippet}
            </Text>
          ) : (
            summary.length === 0 && (
              <Text size="xs" c="dimmed">
                No additional details.
              </Text>
            )
          )}
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  )
}
