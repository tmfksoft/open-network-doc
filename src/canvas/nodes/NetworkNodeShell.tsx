import type { ReactNode } from 'react'
import { Stack, Text, ThemeIcon } from '@mantine/core'
import { NodeCard } from './NodeCard'
import type { DocNode } from '../../fileformat/types'

interface NetworkNodeShellProps {
  node: DocNode
  icon: ReactNode
  label: string
  subtext?: string
  selected?: boolean
  accentColor?: string
}

/** Shared canvas presentation for connectable network nodes: icon centered above a label, subtext below. */
export function NetworkNodeShell({
  node,
  icon,
  label,
  subtext,
  selected,
  accentColor,
}: NetworkNodeShellProps) {
  return (
    <NodeCard node={node} selected={selected} accentColor={accentColor}>
      <Stack gap={4} align="center">
        <ThemeIcon variant="light" color={accentColor} size={40} radius="md">
          {icon}
        </ThemeIcon>
        <Text fw={600} size="sm" ta="center" truncate style={{ width: '100%' }}>
          {label}
        </Text>
        {subtext && (
          <Text size="xs" c="dimmed" ta="center">
            {subtext}
          </Text>
        )}
      </Stack>
    </NodeCard>
  )
}
