import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type OnConnect,
  type OnNodeDrag,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useDocumentStore } from '../store/useDocumentStore'
import { getFlowNodesForSheet, getFlowEdgesForSheet } from '../store/selectors'
import { nodeTypes } from './nodeTypes'
import { edgeTypes } from './edgeTypes'
import PaneContextMenu, { type PaneContextMenuState } from './contextMenu/PaneContextMenu'
import { GROUP_DEFAULT_WIDTH, GROUP_DEFAULT_HEIGHT } from './nodes/groupLayoutConstants'

function CanvasInner() {
  const activeSheetId = useDocumentStore((s) => s.activeSheetId)
  const selection = useDocumentStore((s) => s.selection)
  const docNodes = useDocumentStore((s) => s.nodesBySheet[activeSheetId] ?? [])
  const docEdges = useDocumentStore((s) => s.edgesBySheet[activeSheetId] ?? [])
  const onNodesChange = useDocumentStore((s) => s.onNodesChange)
  const onEdgesChange = useDocumentStore((s) => s.onEdgesChange)
  const onConnectStore = useDocumentStore((s) => s.onConnect)
  const addNode = useDocumentStore((s) => s.addNode)
  const updateNode = useDocumentStore((s) => s.updateNode)
  const assignNodeToGroup = useDocumentStore((s) => s.assignNodeToGroup)
  const select = useDocumentStore((s) => s.select)
  const clearSelection = useDocumentStore((s) => s.clearSelection)

  const { screenToFlowPosition } = useReactFlow()
  const [menu, setMenu] = useState<PaneContextMenuState | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)

  const nodes = useMemo(
    () => getFlowNodesForSheet(docNodes, selection, draggingNodeId),
    [docNodes, selection, draggingNodeId],
  )
  const edges = useMemo(() => getFlowEdgesForSheet(docEdges, selection), [docEdges, selection])

  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault()
      const clientX = 'clientX' in event ? event.clientX : 0
      const clientY = 'clientY' in event ? event.clientY : 0
      const flowPos = screenToFlowPosition({ x: clientX, y: clientY })
      setMenu({ clientX, clientY, flowX: flowPos.x, flowY: flowPos.y })
    },
    [screenToFlowPosition],
  )

  const handleAddDevice = useCallback(
    (flowX: number, flowY: number) => {
      const id = addNode(activeSheetId, 'device', { x: flowX, y: flowY }, {})
      select({ kind: 'node', id })
      setMenu(null)
    },
    [activeSheetId, addNode, select],
  )

  const handleAddGroup = useCallback(
    (flowX: number, flowY: number) => {
      const id = addNode(activeSheetId, 'group_header', { x: flowX, y: flowY }, {})
      updateNode(activeSheetId, id, { width: GROUP_DEFAULT_WIDTH, height: GROUP_DEFAULT_HEIGHT })
      select({ kind: 'node', id })
      setMenu(null)
    },
    [activeSheetId, addNode, updateNode, select],
  )

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => select({ kind: 'node', id: node.id }),
    [select],
  )

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => select({ kind: 'edge', id: edge.id }),
    [select],
  )

  const handleConnect: OnConnect = useCallback(
    (connection) => onConnectStore(activeSheetId, connection),
    [activeSheetId, onConnectStore],
  )

  const handleNodeDragStart: OnNodeDrag = useCallback((_event, node) => {
    setDraggingNodeId(node.id)
  }, [])

  const handleNodeDragStop: OnNodeDrag = useCallback(
    (_event, node) => {
      setDraggingNodeId(null)
      if (node.type === 'group_header') return

      // Resolve the dropped node's absolute (sheet-space) center. `node.position`
      // from the callback is relative to its (possibly stale, pre-drop) parent,
      // so this is computed from our own store data rather than React Flow's
      // `getIntersectingNodes`, which does not reliably resolve absolute
      // position for nodes that already have a parentId.
      const storeNode = docNodes.find((n) => n.id === node.id)
      const width = storeNode?.width ?? 180
      const height = storeNode?.height ?? 113
      const parent = node.parentId ? docNodes.find((n) => n.id === node.parentId) : undefined
      const absX = (parent?.position.x ?? 0) + node.position.x
      const absY = (parent?.position.y ?? 0) + node.position.y
      const centerX = absX + width / 2
      const centerY = absY + height / 2

      const targetGroup = docNodes.find((n) => {
        if (n.type !== 'group_header' || n.id === node.id) return false
        const gw = n.width ?? GROUP_DEFAULT_WIDTH
        const gh = n.height ?? GROUP_DEFAULT_HEIGHT
        return (
          centerX >= n.position.x &&
          centerX <= n.position.x + gw &&
          centerY >= n.position.y &&
          centerY <= n.position.y + gh
        )
      })

      const targetGroupId = targetGroup?.id ?? null
      if (targetGroupId !== (node.parentId ?? null)) {
        assignNodeToGroup(activeSheetId, node.id, targetGroupId)
      }
    },
    [activeSheetId, assignNodeToGroup, docNodes],
  )

  if (!activeSheetId) return null

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={(changes) => onNodesChange(activeSheetId, changes)}
        onEdgesChange={(changes) => onEdgesChange(activeSheetId, changes)}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={clearSelection}
        onPaneContextMenu={handlePaneContextMenu}
        colorMode="dark"
        fitView
        fitViewOptions={{ maxZoom: 1 }}
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
      <PaneContextMenu
        state={menu}
        onClose={() => setMenu(null)}
        onAddDevice={handleAddDevice}
        onAddGroup={handleAddGroup}
      />
    </div>
  )
}

export default function ReactFlowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  )
}
