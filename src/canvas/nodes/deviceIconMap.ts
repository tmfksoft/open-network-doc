import {
  IconServer,
  IconDeviceDesktop,
  IconRouter,
  IconTopologyStar3,
  IconFirewallFlame,
  IconAccessPoint,
  IconPrinter,
  IconDevices,
  type IconProps,
} from '@tabler/icons-react'
import type { DeviceType } from '../../fileformat/types'

export const DEVICE_TYPE_ICONS: Record<DeviceType, React.ComponentType<IconProps>> = {
  server: IconServer,
  workstation: IconDeviceDesktop,
  router: IconRouter,
  switch: IconTopologyStar3,
  firewall: IconFirewallFlame,
  ap: IconAccessPoint,
  printer: IconPrinter,
  other: IconDevices,
}

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  server: 'Server',
  workstation: 'Workstation',
  router: 'Router',
  switch: 'Switch',
  firewall: 'Firewall',
  ap: 'Access Point',
  printer: 'Printer',
  other: 'Other',
}
