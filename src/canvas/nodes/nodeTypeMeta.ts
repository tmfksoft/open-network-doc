import { IconSitemap, IconTags, IconArrowsHorizontal, IconDoorEnter, IconWorld, IconMarkdown } from '@tabler/icons-react'

export const NETWORK_GROUP_ICON = IconSitemap
export const VLAN_ICON = IconTags
export const IP_RANGE_ICON = IconArrowsHorizontal
export const SHEET_PORTAL_ICON = IconDoorEnter
export const MARKDOWN_NOTE_ICON = IconMarkdown

export const NETWORK_GROUP_LABEL = 'Network Group'
export const VLAN_LABEL = 'VLAN'
export const IP_RANGE_LABEL = 'IP Range'
export const SHEET_PORTAL_LABEL = 'Sheet Link'
export const MARKDOWN_NOTE_LABEL = 'Markdown Note'

const INTERNET_NAME_PATTERN = /^(the\s+)?internet$/i

/** A network group literally named "Internet"/"The Internet" gets a globe icon instead of the generic one. */
export function networkGroupIcon(label: string) {
  return INTERNET_NAME_PATTERN.test(label.trim()) ? IconWorld : NETWORK_GROUP_ICON
}

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
