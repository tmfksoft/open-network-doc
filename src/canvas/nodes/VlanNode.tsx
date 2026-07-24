import type { NodeProps } from '@xyflow/react'
import type { VlanDocNode } from '../../fileformat/types'
import { NetworkNodeShell } from './NetworkNodeShell'
import { VLAN_ICON, vlanColor } from './nodeTypeMeta'

export default function VlanNode({ data, selected }: NodeProps) {
  const { docNode, highlighted } = data as unknown as { docNode: VlanDocNode; highlighted?: boolean }
  const Icon = VLAN_ICON
  const vlan = docNode.data
  const subtext = [vlan.vlanId != null ? `VLAN ${vlan.vlanId}` : undefined, vlan.vlanName]
    .filter(Boolean)
    .join(' · ')

  return (
    <NetworkNodeShell
      node={docNode}
      icon={<Icon size={24} />}
      label={docNode.label}
      subtext={subtext || undefined}
      selected={selected}
      highlighted={highlighted}
      accentColor={vlanColor(vlan.vlanId)}
    />
  )
}
