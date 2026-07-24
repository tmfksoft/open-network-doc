import type { ReactNode } from 'react'
import { Paper } from '@mantine/core'
import { NodeHandles } from './NodeHandles'
import NodeHoverCard from '../popovers/NodeHoverCard'
import type { DocNode } from '../../fileformat/types'

/** Amber "trace this VLAN" glow, distinct from the blue selection outline. */
const HIGHLIGHT_COLOR = '#fab005'

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

  return (
    <NodeHoverCard node={node}>
      <Paper
        withBorder
        shadow={selected ? 'md' : 'xs'}
        radius="md"
        p="sm"
        w={180}
        style={{
          borderColor,
          borderWidth: selected || highlighted ? 2 : 1,
          boxShadow: highlighted ? `0 0 0 3px ${HIGHLIGHT_COLOR}55` : undefined,
        }}
      >
        <NodeHandles />
        {children}
      </Paper>
    </NodeHoverCard>
  )
}
