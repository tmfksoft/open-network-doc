import type { ReactNode } from 'react'
import { Paper } from '@mantine/core'
import { NodeResizer } from '@xyflow/react'
import { NodeHandles } from './NodeHandles'
import NodeHoverCard from '../popovers/NodeHoverCard'
import type { DocNode } from '../../fileformat/types'

/** Amber "trace this VLAN" glow, distinct from the blue selection outline. */
const HIGHLIGHT_COLOR = '#fab005'

export const NODE_CARD_DEFAULT_WIDTH = 180
export const NODE_CARD_DEFAULT_HEIGHT = 113
const MIN_WIDTH = 110
const MIN_HEIGHT = 70

interface NodeCardProps {
  node: DocNode
  selected?: boolean
  /** Set when this node's VLAN matches the currently clicked VLAN node. */
  highlighted?: boolean
  /** Mantine color name (e.g. from VLAN color coding) tinting the border when not selected. */
  accentColor?: string
  children: ReactNode
}

/** Shared Paper + connection-handle + hover-summary wrapper for all connectable canvas node types. */
export function NodeCard({ node, selected, highlighted, accentColor, children }: NodeCardProps) {
  const borderColor = selected
    ? 'var(--mantine-color-blue-6)'
    : highlighted
      ? HIGHLIGHT_COLOR
      : accentColor
        ? `var(--mantine-color-${accentColor}-6)`
        : undefined

  const width = node.width ?? NODE_CARD_DEFAULT_WIDTH
  const height = node.height ?? NODE_CARD_DEFAULT_HEIGHT

  return (
    <NodeHoverCard node={node}>
      <Paper
        withBorder
        shadow={selected ? 'md' : 'xs'}
        radius="md"
        p="sm"
        style={{
          width,
          height,
          borderColor,
          borderWidth: selected || highlighted ? 2 : 1,
          boxShadow: highlighted ? `0 0 0 3px ${HIGHLIGHT_COLOR}55` : undefined,
        }}
      >
        <NodeResizer
          isVisible={selected}
          minWidth={MIN_WIDTH}
          minHeight={MIN_HEIGHT}
          lineStyle={{ borderColor: 'var(--mantine-color-blue-6)' }}
          handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
        />
        <NodeHandles width={width} height={height} />
        {children}
      </Paper>
    </NodeHoverCard>
  )
}
