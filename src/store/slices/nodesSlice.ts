import type { StateCreator } from 'zustand'
import type { NodeChange, EdgeChange, Connection } from '@xyflow/react'
import { applyNodeChanges } from '@xyflow/react'
import type { DocumentStore } from '../useDocumentStore'
import type { DocNode, DocEdge, NodeType, EdgeType, NodeTypeData } from '../../fileformat/types'
import { toFlowNode } from '../selectors'
import { relayoutGroupNodes } from '../groupLayout'

export interface NodesSlice {
  nodesBySheet: Record<string, DocNode[]>
  edgesBySheet: Record<string, DocEdge[]>
  addNode: <T extends NodeType>(
    sheetId: string,
    type: T,
    position: { x: number; y: number },
    data: NodeTypeData<T>,
    label?: string,
  ) => string
  updateNode: (sheetId: string, nodeId: string, patch: Partial<DocNode>) => void
  removeNode: (sheetId: string, nodeId: string) => void
  duplicateNode: (sheetId: string, nodeId: string) => string | undefined
  assignNodeToGroup: (sheetId: string, nodeId: string, groupId: string | null) => void
  addEdge: (
    sheetId: string,
    sourceNodeId: string,
    targetNodeId: string,
    sourceHandle?: string | null,
    targetHandle?: string | null,
    type?: EdgeType,
  ) => string
  updateEdge: (sheetId: string, edgeId: string, patch: Partial<DocEdge>) => void
  removeEdge: (sheetId: string, edgeId: string) => void
  onNodesChange: (sheetId: string, changes: NodeChange[]) => void
  onEdgesChange: (sheetId: string, changes: EdgeChange[]) => void
  onConnect: (sheetId: string, connection: Connection) => void
}

export const createNodesSlice: StateCreator<DocumentStore, [], [], NodesSlice> = (
  set,
  get,
) => ({
  nodesBySheet: {},
  edgesBySheet: {},

  addNode: (sheetId, type, position, data, label) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const node = {
      id,
      sheetId,
      type,
      position,
      label: label ?? defaultLabelFor(type),
      data,
      createdAt: now,
      updatedAt: now,
    } as DocNode
    set((state) => ({
      nodesBySheet: {
        ...state.nodesBySheet,
        [sheetId]: [...(state.nodesBySheet[sheetId] ?? []), node],
      },
      dirty: true,
    }))
    return id
  },

  updateNode: (sheetId, nodeId, patch) => {
    set((state) => ({
      nodesBySheet: {
        ...state.nodesBySheet,
        [sheetId]: (state.nodesBySheet[sheetId] ?? []).map((n) =>
          n.id === nodeId
            ? ({ ...n, ...patch, updatedAt: new Date().toISOString() } as DocNode)
            : n,
        ),
      },
      dirty: true,
    }))
  },

  removeNode: (sheetId, nodeId) => {
    set((state) => ({
      nodesBySheet: {
        ...state.nodesBySheet,
        [sheetId]: (state.nodesBySheet[sheetId] ?? []).filter(
          (n) => n.id !== nodeId && n.parentId !== nodeId,
        ),
      },
      edgesBySheet: {
        ...state.edgesBySheet,
        [sheetId]: (state.edgesBySheet[sheetId] ?? []).filter(
          (e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId,
        ),
      },
      selection: state.selection?.id === nodeId ? null : state.selection,
      dirty: true,
    }))
  },

  duplicateNode: (sheetId, nodeId) => {
    const docNodes = get().nodesBySheet[sheetId] ?? []
    const node = docNodes.find((n) => n.id === nodeId)
    if (!node) return undefined

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    // Duplicates drop group membership rather than trying to slot into the
    // grid or preserve absolute position relative to a parent — simpler, and
    // the copy can be dragged back into a group afterward if wanted.
    const copy = {
      ...node,
      id,
      label: `${node.label} copy`,
      position: { x: node.position.x + 30, y: node.position.y + 30 },
      parentId: undefined,
      createdAt: now,
      updatedAt: now,
    } as DocNode

    set((state) => ({
      nodesBySheet: { ...state.nodesBySheet, [sheetId]: [...(state.nodesBySheet[sheetId] ?? []), copy] },
      dirty: true,
    }))
    return id
  },

  assignNodeToGroup: (sheetId, nodeId, groupId) => {
    set((state) => {
      const docNodes = state.nodesBySheet[sheetId] ?? []
      const node = docNodes.find((n) => n.id === nodeId)
      if (!node || node.parentId === (groupId ?? undefined)) return state

      const previousGroupId = node.parentId

      let nextNodes = docNodes.map((n) => {
        if (n.id !== nodeId) return n
        if (groupId) {
          // Position doesn't matter here — relayoutGroupNodes below will
          // place it into the next free grid cell.
          return { ...n, parentId: groupId, updatedAt: new Date().toISOString() } as DocNode
        }
        // Leaving a group: convert the relative position back to an absolute
        // one (relative to the old group's own position) so it doesn't jump.
        const oldGroup = previousGroupId ? docNodes.find((g) => g.id === previousGroupId) : undefined
        const position = oldGroup
          ? { x: oldGroup.position.x + n.position.x, y: oldGroup.position.y + n.position.y }
          : n.position
        return {
          ...n,
          parentId: undefined,
          position,
          updatedAt: new Date().toISOString(),
        } as DocNode
      })

      if (groupId) nextNodes = relayoutGroupNodes(nextNodes, groupId)
      if (previousGroupId && previousGroupId !== groupId) {
        nextNodes = relayoutGroupNodes(nextNodes, previousGroupId)
      }

      return {
        nodesBySheet: { ...state.nodesBySheet, [sheetId]: nextNodes },
        dirty: true,
      }
    })
  },

  addEdge: (sheetId, sourceNodeId, targetNodeId, sourceHandle, targetHandle, type = 'physical_link') => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const edge: DocEdge = {
      id,
      sheetId,
      sourceNodeId,
      targetNodeId,
      sourceHandle: sourceHandle ?? undefined,
      targetHandle: targetHandle ?? undefined,
      type,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({
      edgesBySheet: {
        ...state.edgesBySheet,
        [sheetId]: [...(state.edgesBySheet[sheetId] ?? []), edge],
      },
      dirty: true,
    }))
    return id
  },

  updateEdge: (sheetId, edgeId, patch) => {
    set((state) => ({
      edgesBySheet: {
        ...state.edgesBySheet,
        [sheetId]: (state.edgesBySheet[sheetId] ?? []).map((e) =>
          e.id === edgeId ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e,
        ),
      },
      dirty: true,
    }))
  },

  removeEdge: (sheetId, edgeId) => {
    set((state) => ({
      edgesBySheet: {
        ...state.edgesBySheet,
        [sheetId]: (state.edgesBySheet[sheetId] ?? []).filter((e) => e.id !== edgeId),
      },
      selection: state.selection?.id === edgeId ? null : state.selection,
      dirty: true,
    }))
  },

  onNodesChange: (sheetId, changes) => {
    // Only touch nodes that actually have a change entry, and only replace
    // their object reference when a value genuinely differs — otherwise React
    // Flow's own re-measurement (triggered by receiving new node references)
    // fights with this handler and the node never settles out of the
    // "unmeasured" (visibility: hidden) state.
    const touchedIds = new Set(changes.filter((c) => 'id' in c).map((c) => c.id))
    if (touchedIds.size === 0) return

    const docNodes = get().nodesBySheet[sheetId] ?? []
    const touchedFlowNodes = docNodes
      .filter((n) => touchedIds.has(n.id))
      .map((n) => toFlowNode(n))
    const nextTouchedFlowNodes = applyNodeChanges(changes, touchedFlowNodes)
    const removedIds = new Set(
      changes.filter((c) => c.type === 'remove').map((c) => c.id),
    )
    const nextById = new Map(nextTouchedFlowNodes.map((n) => [n.id, n]))

    let changedAny = false
    const nextNodes = docNodes
      .filter((n) => !removedIds.has(n.id))
      .map((n) => {
        const fn = nextById.get(n.id)
        if (!fn) return n
        const width = fn.width ?? n.width
        const height = fn.height ?? n.height
        if (n.position.x === fn.position.x && n.position.y === fn.position.y && n.width === width && n.height === height) {
          return n
        }
        changedAny = true
        return { ...n, position: fn.position, width, height }
      })

    if (!changedAny && removedIds.size === 0) return

    // If a group's width changed (resize), re-flow its children into the grid.
    let finalNodes = nextNodes
    for (const id of touchedIds) {
      const before = docNodes.find((n) => n.id === id)
      const after = nextById.get(id)
      if (before?.type === 'group_header' && after && before.width !== (after.width ?? before.width)) {
        finalNodes = relayoutGroupNodes(finalNodes, id)
      }
    }

    set((state) => ({
      nodesBySheet: { ...state.nodesBySheet, [sheetId]: finalNodes },
      dirty: state.dirty || changes.some((c) => c.type !== 'select'),
    }))
  },

  onEdgesChange: (sheetId, changes) => {
    const docEdges = get().edgesBySheet[sheetId] ?? []
    const removedIds = new Set(
      changes.filter((c) => c.type === 'remove').map((c) => c.id),
    )
    if (removedIds.size === 0) return
    set((state) => ({
      edgesBySheet: {
        ...state.edgesBySheet,
        [sheetId]: docEdges.filter((e) => !removedIds.has(e.id)),
      },
      dirty: true,
    }))
  },

  onConnect: (sheetId, connection) => {
    if (!connection.source || !connection.target) return
    get().addEdge(
      sheetId,
      connection.source,
      connection.target,
      connection.sourceHandle,
      connection.targetHandle,
    )
  },
})

function defaultLabelFor(type: NodeType): string {
  switch (type) {
    case 'device':
      return 'New Device'
    case 'network_group':
      return 'New Network Group'
    case 'vlan':
      return 'New VLAN'
    case 'ip_range':
      return 'New IP Range'
    case 'group_header':
      return 'New Group'
    case 'sheet_portal':
      return 'Sheet Link'
  }
}
