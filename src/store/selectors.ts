import { MarkerType, type Node, type Edge } from '@xyflow/react'
import type { DocNode, DocEdge } from '../fileformat/types'
import type { Selection } from './slices/uiSlice'

/** Default arrowhead color when the edge has no custom color set. */
const DEFAULT_ARROW_COLOR = '#b1b1b7'

function edgeMarkers(edge: DocEdge): Pick<Edge, 'markerStart' | 'markerEnd'> {
  if (!edge.arrowStyle || edge.arrowStyle === 'none') return {}
  const marker = { type: MarkerType.ArrowClosed, color: edge.color ?? DEFAULT_ARROW_COLOR }
  return edge.arrowStyle === 'both' ? { markerStart: marker, markerEnd: marker } : { markerEnd: marker }
}

export function toFlowNode(node: DocNode, selected = false): Node {
  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: { ...node.data, label: node.label, docNode: node },
    parentId: node.parentId,
    extent: node.extent,
    width: node.width,
    height: node.height,
    zIndex: node.zIndex,
    selected,
  }
}

export function toFlowEdge(edge: DocEdge, selected = false): Edge {
  return {
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type,
    label: edge.label,
    data: { docEdge: edge },
    selected,
    ...edgeMarkers(edge),
  }
}

/** React Flow requires parent nodes to appear before their children in the array. */
export function sortNodesParentFirst(nodes: DocNode[]): DocNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const visited = new Set<string>()
  const result: DocNode[] = []

  function visit(node: DocNode) {
    if (visited.has(node.id)) return
    visited.add(node.id)
    if (node.parentId && byId.has(node.parentId)) {
      visit(byId.get(node.parentId)!)
    }
    result.push(node)
  }

  for (const node of nodes) visit(node)
  return result
}

/** Rendered above all normal content so a dragged node/group is never hidden behind other elements. */
const DRAGGING_Z_INDEX = 10000
const DRAGGING_CHILD_Z_INDEX = 10001

/** VLAN ID carried by node types that participate in VLAN highlighting (devices and VLAN nodes themselves). */
function nodeVlanId(node: DocNode): number | undefined {
  if (node.type === 'device' || node.type === 'vlan') return node.data.vlanId ?? 0
  return undefined
}

export function getFlowNodesForSheet(
  nodes: DocNode[],
  selection: Selection,
  draggingNodeId?: string | null,
  highlightVlanId?: number | null,
): Node[] {
  return sortNodesParentFirst(nodes).map((n) => {
    let flowNode = toFlowNode(n, selection?.kind === 'node' && selection.id === n.id)
    if (n.id === draggingNodeId) flowNode = { ...flowNode, zIndex: DRAGGING_Z_INDEX }
    // If a group is being dragged, keep its children rendered above it (and everything else).
    else if (draggingNodeId && n.parentId === draggingNodeId) flowNode = { ...flowNode, zIndex: DRAGGING_CHILD_Z_INDEX }
    if (highlightVlanId != null) {
      flowNode = { ...flowNode, data: { ...flowNode.data, highlighted: nodeVlanId(n) === highlightVlanId } }
    }
    return flowNode
  })
}

export function getFlowEdgesForSheet(
  edges: DocEdge[],
  selection: Selection,
  highlightVlanId?: number | null,
): Edge[] {
  return edges.map((e) => {
    const flowEdge = toFlowEdge(e, selection?.kind === 'edge' && selection.id === e.id)
    if (highlightVlanId == null) return flowEdge
    return { ...flowEdge, data: { ...flowEdge.data, highlighted: (e.vlanId ?? 0) === highlightVlanId } }
  })
}
