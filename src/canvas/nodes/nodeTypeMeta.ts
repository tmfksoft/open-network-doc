import { IconSitemap, IconTags, IconArrowsHorizontal, IconDoorEnter } from '@tabler/icons-react'

export const NETWORK_GROUP_ICON = IconSitemap
export const VLAN_ICON = IconTags
export const IP_RANGE_ICON = IconArrowsHorizontal
export const SHEET_PORTAL_ICON = IconDoorEnter

export const NETWORK_GROUP_LABEL = 'Network Group'
export const VLAN_LABEL = 'VLAN'
export const IP_RANGE_LABEL = 'IP Range'
export const SHEET_PORTAL_LABEL = 'Sheet Link'

// Deterministic per-VLAN accent color so distinct VLANs are visually
// distinguishable across a diagram at a glance, without needing to read labels.
const VLAN_COLOR_PALETTE = [
  'blue',
  'grape',
  'teal',
  'orange',
  'pink',
  'cyan',
  'lime',
  'violet',
  'red',
  'yellow',
]

export function vlanColor(vlanId: number | undefined): string | undefined {
  if (vlanId == null) return undefined
  const index = ((vlanId % VLAN_COLOR_PALETTE.length) + VLAN_COLOR_PALETTE.length) % VLAN_COLOR_PALETTE.length
  return VLAN_COLOR_PALETTE[index]
}
