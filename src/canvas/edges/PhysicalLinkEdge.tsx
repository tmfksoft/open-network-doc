import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import { Group, Text, ThemeIcon } from '@mantine/core'
import type { DocEdge } from '../../fileformat/types'
import { EDGE_TYPE_ICONS } from './edgeTypeMeta'

/** Amber "trace this VLAN" glow, matching NodeCard's highlight color. */
const HIGHLIGHT_COLOR = '#fab005'
/** Px between adjacent edges sharing the same pair of nodes, so they don't render as one overlapping line. */
const PARALLEL_SPACING = 24

interface ParallelEdgeData {
  parallelIndex?: number
  parallelCount?: number
}

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
  markerStart,
  markerEnd,
}: EdgeProps) {
  const { parallelIndex, parallelCount = 1 } = (data as ParallelEdgeData | undefined) ?? {}

  // Edges sharing a node pair would otherwise draw as one identical
  // overlapping line with stacked, unreadable labels — nudge the path's
  // midpoint sideways (perpendicular to whichever axis dominates the
  // connection) so each one fans out into its own visible channel.
  let centerX: number | undefined
  let centerY: number | undefined
  if (parallelCount > 1 && parallelIndex != null) {
    const offset = (parallelIndex - (parallelCount - 1) / 2) * PARALLEL_SPACING
    if (Math.abs(targetY - sourceY) >= Math.abs(targetX - sourceX)) {
      centerX = (sourceX + targetX) / 2 + offset
    } else {
      centerY = (sourceY + targetY) / 2 + offset
    }
  }

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    centerX,
    centerY,
  })

  const docEdge = (data as { docEdge?: DocEdge } | undefined)?.docEdge
  const highlighted = (data as { highlighted?: boolean } | undefined)?.highlighted
  const Icon = EDGE_TYPE_ICONS[docEdge?.type ?? 'physical_link']
  const color = docEdge?.color
  // The VLAN-trace highlight takes priority over both the default and custom
  // stroke colors — it's a deliberate, temporary emphasis for one VLAN.
  const stroke = highlighted ? HIGHLIGHT_COLOR : (color ?? (selected ? 'var(--mantine-color-blue-6)' : undefined))
  const borderColor = highlighted
    ? HIGHLIGHT_COLOR
    : (color ?? (selected ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-default-border)'))

  const strokeDasharray = docEdge?.lineStyle === 'dashed' ? '8 5' : undefined

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{ stroke, strokeWidth: selected || highlighted ? 3 : 1.5, strokeDasharray }}
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
              border: `1px solid ${borderColor}`,
              borderRadius: 999,
            }}
          >
            <ThemeIcon
              variant="light"
              size={20}
              radius="xl"
              style={color ? { backgroundColor: color, color: 'white' } : undefined}
            >
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
