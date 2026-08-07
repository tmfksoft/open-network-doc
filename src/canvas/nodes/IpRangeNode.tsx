import type { NodeProps } from '@xyflow/react'
import type { IpRangeDocNode } from '../../fileformat/types'
import { NetworkNodeShell } from './NetworkNodeShell'
import { IP_RANGE_ICON } from './nodeTypeMeta'

export default function IpRangeNode({ data, selected }: NodeProps) {
  const { docNode, handlesVisible } = data as unknown as { docNode: IpRangeDocNode; handlesVisible?: boolean }
  const Icon = IP_RANGE_ICON
  const range = docNode.data
  const subtext =
    range.cidr ||
    (range.rangeStart && range.rangeEnd ? `${range.rangeStart} – ${range.rangeEnd}` : undefined)

  return (
    <NetworkNodeShell
      node={docNode}
      icon={<Icon size={24} />}
      label={docNode.label}
      subtext={subtext}
      selected={selected}
      backgroundColor={range.backgroundColor}
      borderColor={range.borderColor}
      handlesVisible={handlesVisible}
    />
  )
}
