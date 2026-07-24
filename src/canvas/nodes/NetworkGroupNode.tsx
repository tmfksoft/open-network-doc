import type { NodeProps } from '@xyflow/react'
import type { NetworkGroupDocNode } from '../../fileformat/types'
import { NetworkNodeShell } from './NetworkNodeShell'
import { networkGroupIcon } from './nodeTypeMeta'

export default function NetworkGroupNode({ data, selected }: NodeProps) {
  const { docNode } = data as unknown as { docNode: NetworkGroupDocNode }
  const Icon = networkGroupIcon(docNode.label)

  return (
    <NetworkNodeShell
      node={docNode}
      icon={<Icon size={24} />}
      label={docNode.label}
      subtext={docNode.data.cidr}
      selected={selected}
    />
  )
}
