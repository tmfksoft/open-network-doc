import type { Node, Edge } from '@xyflow/react'
import type { DocNode, DocEdge } from '../fileformat/types'
import type { Selection } from './slices/uiSlice'

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

export function getFlowNodesForSheet(
  nodes: DocNode[],
  selection: Selection,
  draggingNodeId?: string | null,
): Node[] {
  return sortNodesParentFirst(nodes).map((n) => {
    const flowNode = toFlowNode(n, selection?.kind === 'node' && selection.id === n.id)
    if (!draggingNodeId) return flowNode
    if (n.id === draggingNodeId) return { ...flowNode, zIndex: DRAGGING_Z_INDEX }
    // If a group is being dragged, keep its children rendered above it (and everything else).
    if (n.parentId === draggingNodeId) return { ...flowNode, zIndex: DRAGGING_CHILD_Z_INDEX }
    return flowNode
  })
}

export function getFlowEdgesForSheet(edges: DocEdge[], selection: Selection): Edge[] {
  return edges.map((e) => toFlowEdge(e, selection?.kind === 'edge' && selection.id === e.id))
}
