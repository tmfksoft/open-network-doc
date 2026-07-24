import type { ReactNode } from 'react'
import { Paper } from '@mantine/core'
import { NodeHandles } from './NodeHandles'
import NodeHoverCard from '../popovers/NodeHoverCard'
import type { DocNode } from '../../fileformat/types'

interface NodeCardProps {
  node: DocNode
  selected?: boolean
  /** Mantine color name (e.g. from VLAN color coding) tinting the border when not selected. */
  accentColor?: string
  children: ReactNode
}

/** Shared Paper + connection-handle + hover-summary wrapper for all connectable canvas node types. */
export function NodeCard({ node, selected, accentColor, children }: NodeCardProps) {
  const borderColor = selected
    ? 'var(--mantine-color-blue-6)'
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
        style={{ borderColor, borderWidth: selected ? 2 : 1 }}
      >
        <NodeHandles />
        {children}
      </Paper>
    </NodeHoverCard>
  )
}
