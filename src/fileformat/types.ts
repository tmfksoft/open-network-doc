export type NodeType =
  | 'device'
  | 'network_group'
  | 'vlan'
  | 'ip_range'
  | 'group_header'
  | 'sheet_portal'

export type EdgeType = 'physical_link' | 'logical_link' | 'vlan_membership' | 'vpn_tunnel'

export type DeviceType =
  | 'server'
  | 'workstation'
  | 'router'
  | 'switch'
  | 'firewall'
  | 'ap'
  | 'printer'
  | 'other'

export interface DeviceData {
  hostname?: string
  dhcp?: boolean
  staticIp?: string
  macAddress?: string
  deviceType?: DeviceType
  vendor?: string
  model?: string
  os?: string
  iconAssetId?: string
  /** VLAN tag for this device; 0 is the conventional "no specific VLAN" default. */
  vlanId?: number
}

export interface NetworkGroupData {
  cidr?: string
}

export interface VlanData {
  vlanId?: number
  vlanName?: string
}

export interface IpRangeData {
  rangeStart?: string
  rangeEnd?: string
  cidr?: string
  purpose?: string
}

export interface GroupHeaderData {
  icon?: string
  /** Uploaded logo asset id; when set, replaces the picked icon on the canvas. */
  logoAssetId?: string
  headerColor?: string
  collapsed?: boolean
}

export interface SheetPortalData {
  targetSheetId?: string
  targetNodeId?: string
  labelOverride?: string
}

export type NodeTypeData<T extends NodeType> = T extends 'device'
  ? DeviceData
  : T extends 'network_group'
    ? NetworkGroupData
    : T extends 'vlan'
      ? VlanData
      : T extends 'ip_range'
        ? IpRangeData
        : T extends 'group_header'
          ? GroupHeaderData
          : T extends 'sheet_portal'
            ? SheetPortalData
            : never

interface BaseDocNode {
  id: string
  sheetId: string
  parentId?: string
  extent?: 'parent'
  position: { x: number; y: number }
  width?: number
  height?: number
  zIndex?: number
  label: string
  /** Markdown description body, kept in memory; persisted as a separate .md file in the archive. */
  description?: string
  createdAt: string
  updatedAt: string
}

export interface DeviceDocNode extends BaseDocNode {
  type: 'device'
  data: DeviceData
}
export interface NetworkGroupDocNode extends BaseDocNode {
  type: 'network_group'
  data: NetworkGroupData
}
export interface VlanDocNode extends BaseDocNode {
  type: 'vlan'
  data: VlanData
}
export interface IpRangeDocNode extends BaseDocNode {
  type: 'ip_range'
  data: IpRangeData
}
export interface GroupHeaderDocNode extends BaseDocNode {
  type: 'group_header'
  data: GroupHeaderData
}
export interface SheetPortalDocNode extends BaseDocNode {
  type: 'sheet_portal'
  data: SheetPortalData
}

/** Discriminated union on `type` — enables narrowing via switch/if without casts. */
export type DocNode =
  | DeviceDocNode
  | NetworkGroupDocNode
  | VlanDocNode
  | IpRangeDocNode
  | GroupHeaderDocNode
  | SheetPortalDocNode

export interface PhysicalLinkData {
  portSource?: string
  portTarget?: string
  medium?: 'copper' | 'fiber' | 'wifi'
  speedMbps?: number
  notes?: string
}

export type EdgeLineStyle = 'solid' | 'dashed'
export type EdgeArrowStyle = 'none' | 'forward' | 'both'

export interface DocEdge {
  id: string
  sheetId: string
  sourceNodeId: string
  targetNodeId: string
  sourceHandle?: string
  targetHandle?: string
  type: EdgeType
  label?: string
  /** Hex color (e.g. "#40c057") overriding the default/type-based stroke color. */
  color?: string
  /** VLAN tag for this connection; 0 is the conventional "no specific VLAN" default. */
  vlanId?: number
  /** Solid (default) or dashed stroke. */
  lineStyle?: EdgeLineStyle
  /** Arrowhead(s) on the connection; unset/'none' renders a plain line. */
  arrowStyle?: EdgeArrowStyle
  /** Markdown description body, kept in memory; persisted as a separate .md file in the archive. */
  description?: string
  physicalLink?: PhysicalLinkData
  createdAt: string
  updatedAt: string
}

export interface Sheet {
  id: string
  name: string
  orderIndex: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface KbPage {
  id: string
  slug: string
  title: string
  folderPath?: string
  orderIndex: number
  content?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface DocumentState {
  docId: string
  docTitle: string
  sheets: Sheet[]
  nodesBySheet: Record<string, DocNode[]>
  edgesBySheet: Record<string, DocEdge[]>
  kbPages: KbPage[]
}

export const CURRENT_FORMAT_VERSION = 1

export interface Manifest {
  formatVersion: number
  appVersion: string
  generatedAt: string
  docId: string
}
