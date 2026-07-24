import type { DocNode } from '../fileformat/types'

export interface SummaryLine {
  label: string
  value: string
}

/**
 * Condensed field list shown in a node's hover popover. Intentionally mirrors
 * (a subset of) each inspector's read-only field list so hover and click
 * views never drift apart.
 */
export function getNodeSummary(node: DocNode): SummaryLine[] {
  const lines: SummaryLine[] = []

  switch (node.type) {
    case 'device':
      if (node.data.hostname) lines.push({ label: 'Hostname', value: node.data.hostname })
      if (node.data.dhcp) lines.push({ label: 'IP', value: 'DHCP' })
      else if (node.data.staticIp) lines.push({ label: 'IP', value: node.data.staticIp })
      if (node.data.macAddress) lines.push({ label: 'MAC', value: node.data.macAddress })
      if (node.data.vendor) lines.push({ label: 'Vendor', value: node.data.vendor })
      break
    case 'network_group':
      if (node.data.cidr) lines.push({ label: 'CIDR', value: node.data.cidr })
      break
    case 'vlan':
      if (node.data.vlanId != null) lines.push({ label: 'VLAN ID', value: String(node.data.vlanId) })
      if (node.data.vlanName) lines.push({ label: 'Name', value: node.data.vlanName })
      break
    case 'ip_range':
      if (node.data.cidr) lines.push({ label: 'CIDR', value: node.data.cidr })
      if (node.data.rangeStart && node.data.rangeEnd) {
        lines.push({ label: 'Range', value: `${node.data.rangeStart} – ${node.data.rangeEnd}` })
      }
      if (node.data.purpose) lines.push({ label: 'Purpose', value: node.data.purpose })
      break
    case 'group_header':
      break
    case 'sheet_portal':
      break
  }

  return lines
}
