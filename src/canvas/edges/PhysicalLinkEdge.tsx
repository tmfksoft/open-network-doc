import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import { Group, Text, ThemeIcon } from '@mantine/core'
import type { DocEdge } from '../../fileformat/types'
import { EDGE_TYPE_ICONS } from './edgeTypeMeta'

/** Amber "trace this VLAN" glow, matching NodeCard's highlight color. */
const HIGHLIGHT_COLOR = '#fab005'

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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
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
