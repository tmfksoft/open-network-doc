import type { EdgeTypes } from '@xyflow/react'
import PhysicalLinkEdge from './edges/PhysicalLinkEdge'

export const edgeTypes: EdgeTypes = {
  physical_link: PhysicalLinkEdge,
  logical_link: PhysicalLinkEdge,
  vlan_membership: PhysicalLinkEdge,
  vpn_tunnel: PhysicalLinkEdge,
  http: PhysicalLinkEdge,
  https: PhysicalLinkEdge,
}
