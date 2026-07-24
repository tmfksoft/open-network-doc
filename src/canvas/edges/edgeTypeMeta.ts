import {
  IconPlugConnected,
  IconArrowsExchange,
  IconTag,
  IconShieldLock,
  IconLockOpen,
  IconLock,
  type IconProps,
} from '@tabler/icons-react'
import type { EdgeType } from '../../fileformat/types'

export const EDGE_TYPE_ICONS: Record<EdgeType, React.ComponentType<IconProps>> = {
  physical_link: IconPlugConnected,
  logical_link: IconArrowsExchange,
  vlan_membership: IconTag,
  vpn_tunnel: IconShieldLock,
  // Open padlock for plain HTTP (unencrypted), closed for HTTPS.
  http: IconLockOpen,
  https: IconLock,
}

export const EDGE_TYPE_LABELS: Record<EdgeType, string> = {
  physical_link: 'Physical Link',
  logical_link: 'Logical Link',
  vlan_membership: 'VLAN Membership',
  vpn_tunnel: 'VPN Tunnel',
  http: 'HTTP',
  https: 'HTTPS',
}
