import type { NodeProps } from '@xyflow/react'
import type { DeviceDocNode } from '../../fileformat/types'
import { DeviceTypeIcon } from './deviceIcons'
import { DEVICE_TYPE_LABELS } from './deviceIconMap'
import { NetworkNodeShell } from './NetworkNodeShell'

export default function DeviceNode({ data, selected }: NodeProps) {
  const { docNode } = data as unknown as { docNode: DeviceDocNode }

  return (
    <NetworkNodeShell
      node={docNode}
      icon={<DeviceTypeIcon deviceType={docNode.data.deviceType} size={24} />}
      label={docNode.label}
      subtext={DEVICE_TYPE_LABELS[docNode.data.deviceType ?? 'other']}
      selected={selected}
    />
  )
}
