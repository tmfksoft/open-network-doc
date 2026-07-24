import type { NodeProps } from '@xyflow/react'
import type { NetworkGroupDocNode } from '../../fileformat/types'
import { NetworkNodeShell } from './NetworkNodeShell'
import { NETWORK_GROUP_ICON } from './nodeTypeMeta'

export default function NetworkGroupNode({ data, selected }: NodeProps) {
  const { docNode } = data as unknown as { docNode: NetworkGroupDocNode }
  const Icon = NETWORK_GROUP_ICON

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
