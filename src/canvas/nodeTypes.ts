import type { NodeTypes } from '@xyflow/react'
import DeviceNode from './nodes/DeviceNode'
import GroupHeaderNode from './nodes/GroupHeaderNode'
import NetworkGroupNode from './nodes/NetworkGroupNode'
import VlanNode from './nodes/VlanNode'
import IpRangeNode from './nodes/IpRangeNode'
import SheetPortalNode from './nodes/SheetPortalNode'

export const nodeTypes: NodeTypes = {
  device: DeviceNode,
  group_header: GroupHeaderNode,
  network_group: NetworkGroupNode,
  vlan: VlanNode,
  ip_range: IpRangeNode,
  sheet_portal: SheetPortalNode,
}
