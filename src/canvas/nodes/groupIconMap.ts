import {
  IconFolder,
  IconBuilding,
  IconBuildingWarehouse,
  IconCloud,
  IconNetwork,
  IconWorld,
  IconMapPin,
  IconHome,
  IconServer2,
  type IconProps,
} from '@tabler/icons-react'

export const GROUP_ICON_KEYS = [
  'folder',
  'building',
  'warehouse',
  'cloud',
  'network',
  'world',
  'map-pin',
  'home',
  'rack',
] as const

export type GroupIconKey = (typeof GROUP_ICON_KEYS)[number]

export const GROUP_ICONS: Record<GroupIconKey, React.ComponentType<IconProps>> = {
  folder: IconFolder,
  building: IconBuilding,
  warehouse: IconBuildingWarehouse,
  cloud: IconCloud,
  network: IconNetwork,
  world: IconWorld,
  'map-pin': IconMapPin,
  home: IconHome,
  rack: IconServer2,
}

export const GROUP_ICON_LABELS: Record<GroupIconKey, string> = {
  folder: 'Folder',
  building: 'Building',
  warehouse: 'Warehouse',
  cloud: 'Cloud',
  network: 'Network',
  world: 'World',
  'map-pin': 'Location',
  home: 'Home',
  rack: 'Server Rack',
}
