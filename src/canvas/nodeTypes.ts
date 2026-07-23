import type { NodeTypes } from '@xyflow/react'
import DeviceNode from './nodes/DeviceNode'
import GroupHeaderNode from './nodes/GroupHeaderNode'

export const nodeTypes: NodeTypes = {
  device: DeviceNode,
  group_header: GroupHeaderNode,
}
