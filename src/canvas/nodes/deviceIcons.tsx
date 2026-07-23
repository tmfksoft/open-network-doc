import { IconDevices, type IconProps } from '@tabler/icons-react'
import type { DeviceType } from '../../fileformat/types'
import { DEVICE_TYPE_ICONS } from './deviceIconMap'

export function DeviceTypeIcon({
  deviceType,
  ...props
}: IconProps & { deviceType?: DeviceType }) {
  const Icon = deviceType ? DEVICE_TYPE_ICONS[deviceType] : IconDevices
  return <Icon {...props} />
}
