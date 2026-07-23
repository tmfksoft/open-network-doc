import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import { Group, Text, ThemeIcon } from '@mantine/core'
import type { DocEdge } from '../../fileformat/types'
import { EDGE_TYPE_ICONS } from './edgeTypeMeta'

export default function PhysicalLinkEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  label,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const docEdge = (data as { docEdge?: DocEdge } | undefined)?.docEdge
  const Icon = EDGE_TYPE_ICONS[docEdge?.type ?? 'physical_link']

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: selected ? 'var(--mantine-color-blue-6)' : undefined, strokeWidth: selected ? 2 : 1.5 }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          <Group
            gap={4}
            wrap="nowrap"
            p={2}
            pr={label ? 8 : 2}
            style={{
              background: 'var(--mantine-color-body)',
              border: `1px solid ${selected ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-default-border)'}`,
              borderRadius: 999,
            }}
          >
            <ThemeIcon variant="light" size={20} radius="xl">
              <Icon size={12} />
            </ThemeIcon>
            {label && (
              <Text size="xs" fw={500}>
                {label}
              </Text>
            )}
          </Group>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
