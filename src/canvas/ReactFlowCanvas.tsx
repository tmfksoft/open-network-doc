import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  ControlButton,
  useReactFlow,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type OnConnect,
  type OnNodeDrag,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { IconMagnet } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useUiPrefsStore } from '../store/useUiPrefsStore'
import { getFlowNodesForSheet, getFlowEdgesForSheet } from '../store/selectors'
import { nodeTypes } from './nodeTypes'
import { edgeTypes } from './edgeTypes'
import PaneContextMenu, { type PaneContextMenuState } from './contextMenu/PaneContextMenu'
import NodeContextMenu, { type NodeContextMenuState } from './contextMenu/NodeContextMenu'
import { GROUP_DEFAULT_WIDTH, GROUP_DEFAULT_HEIGHT } from './nodes/groupLayoutConstants'
import { NODE_CARD_DEFAULT_WIDTH, NODE_CARD_DEFAULT_HEIGHT } from './nodes/NodeCard'
import { MARKDOWN_NOTE_DEFAULT_WIDTH, MARKDOWN_NOTE_DEFAULT_HEIGHT } from './nodes/MarkdownNoteNode'
import type { DocNode, NodeType, VlanDocNode } from '../fileformat/types'

const SNAP_GRID: [number, number] = [20, 20]

function CanvasInner() {
  const activeSheetId = useDocumentStore((s) => s.activeSheetId)
  const selection = useDocumentStore((s) => s.selection)
  const focusNodeId = useDocumentStore((s) => s.focusNodeId)
  const highlightVlanId = useDocumentStore((s) => s.highlightVlanId)
  const setHighlightVlanId = useDocumentStore((s) => s.setHighlightVlanId)
  const docNodes = useDocumentStore((s) => s.nodesBySheet[activeSheetId] ?? [])
  const docEdges = useDocumentStore((s) => s.edgesBySheet[activeSheetId] ?? [])
  const onNodesChange = useDocumentStore((s) => s.onNodesChange)
  const onEdgesChange = useDocumentStore((s) => s.onEdgesChange)
  const onConnectStore = useDocumentStore((s) => s.onConnect)
  const addNode = useDocumentStore((s) => s.addNode)
  const updateNode = useDocumentStore((s) => s.updateNode)
  const removeNode = useDocumentStore((s) => s.removeNode)
  const duplicateNode = useDocumentStore((s) => s.duplicateNode)
  const pasteNode = useDocumentStore((s) => s.pasteNode)
  const removeEdge = useDocumentStore((s) => s.removeEdge)
  const assignNodeToGroup = useDocumentStore((s) => s.assignNodeToGroup)
  const select = useDocumentStore((s) => s.select)
  const clearSelection = useDocumentStore((s) => s.clearSelection)
  const setFocusNode = useDocumentStore((s) => s.setFocusNode)
  const snapToGrid = useUiPrefsStore((s) => s.snapToGrid)
  const setSnapToGrid = useUiPrefsStore((s) => s.setSnapToGrid)

  const { screenToFlowPosition, fitView } = useReactFlow()
  const [menu, setMenu] = useState<PaneContextMenuState | null>(null)
  const [nodeMenu, setNodeMenu] = useState<NodeContextMenuState | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [clipboardNode, setClipboardNode] = useState<DocNode | null>(null)

  const nodes = useMemo(
    () => getFlowNodesForSheet(docNodes, selection, draggingNodeId, highlightVlanId),
    [docNodes, selection, draggingNodeId, highlightVlanId],
  )
  const edges = useMemo(
    () => getFlowEdgesForSheet(docEdges, selection, highlightVlanId),
    [docEdges, selection, highlightVlanId],
  )

  // Focus/jump requested by a sheet-portal "Go" button: fitView to the target
  // node once its sheet's nodes have been rendered, then select it.
  useEffect(() => {
    if (!focusNodeId) return
    if (!docNodes.some((n) => n.id === focusNodeId)) return
    const raf = requestAnimationFrame(() => {
      fitView({ nodes: [{ id: focusNodeId }], duration: 300, maxZoom: 1 })
      select({ kind: 'node', id: focusNodeId })
      setFocusNode(null)
    })
    return () => cancelAnimationFrame(raf)
  }, [focusNodeId, docNodes, fitView, select, setFocusNode])

  // Delete/Backspace removes the current selection; Ctrl/Cmd+D duplicates the
  // selected node; Ctrl/Cmd+C copies it; Ctrl/Cmd+V pastes the copy (offset
  // from wherever it last landed, so repeated pastes cascade rather than
  // stack exactly on top of each other). Skipped while focus is in a text
  // field (inspector forms, markdown editors, sheet/KB rename inputs, etc.
  // all use the same keys).
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      if (isEditable) return

      const isMod = event.ctrlKey || event.metaKey

      if (selection) {
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault()
          if (selection.kind === 'node') removeNode(activeSheetId, selection.id)
          else removeEdge(activeSheetId, selection.id)
          return
        }

        if (isMod && event.key.toLowerCase() === 'd') {
          if (selection.kind !== 'node') return
          event.preventDefault()
          const newId = duplicateNode(activeSheetId, selection.id)
          if (newId) select({ kind: 'node', id: newId })
          return
        }

        if (isMod && event.key.toLowerCase() === 'c') {
          if (selection.kind !== 'node') return
          const node = docNodes.find((n) => n.id === selection.id)
          if (node) setClipboardNode(node)
          return
        }
      }

      if (isMod && event.key.toLowerCase() === 'v') {
        if (!clipboardNode) return
        event.preventDefault()
        const newId = pasteNode(activeSheetId, clipboardNode)
        select({ kind: 'node', id: newId })
        // Advance the clipboard's reference position so a second Ctrl+V
        // cascades further away instead of landing exactly on the first paste.
        setClipboardNode({
          ...clipboardNode,
          position: { x: clipboardNode.position.x + 30, y: clipboardNode.position.y + 30 },
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selection, activeSheetId, docNodes, removeNode, removeEdge, duplicateNode, pasteNode, clipboardNode, select])

  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault()
      const clientX = 'clientX' in event ? event.clientX : 0
      const clientY = 'clientY' in event ? event.clientY : 0
      const flowPos = screenToFlowPosition({ x: clientX, y: clientY })
      setMenu({ clientX, clientY, flowX: flowPos.x, flowY: flowPos.y })
      setNodeMenu(null)
    },
    [screenToFlowPosition],
  )

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: { id: string }) => {
      event.preventDefault()
      select({ kind: 'node', id: node.id })
      setNodeMenu({ clientX: event.clientX, clientY: event.clientY, nodeId: node.id })
      setMenu(null)
    },
    [select],
  )

  const handleAddNode = useCallback(
    (type: NodeType, flowX: number, flowY: number) => {
      const id = addNode(activeSheetId, type, { x: flowX, y: flowY }, {})
      const size =
        type === 'group_header'
          ? { width: GROUP_DEFAULT_WIDTH, height: GROUP_DEFAULT_HEIGHT }
          : type === 'markdown'
            ? { width: MARKDOWN_NOTE_DEFAULT_WIDTH, height: MARKDOWN_NOTE_DEFAULT_HEIGHT }
            : { width: NODE_CARD_DEFAULT_WIDTH, height: NODE_CARD_DEFAULT_HEIGHT }
      updateNode(activeSheetId, id, size)
      select({ kind: 'node', id })
      setMenu(null)
    },
    [activeSheetId, addNode, updateNode, select],
  )

  const handlePasteAt = useCallback(
    (flowX: number, flowY: number) => {
      if (!clipboardNode) return
      const id = pasteNode(activeSheetId, clipboardNode, { x: flowX, y: flowY })
      select({ kind: 'node', id })
      setMenu(null)
    },
    [activeSheetId, clipboardNode, pasteNode, select],
  )

  const handleCopyFromMenu = useCallback(
    (nodeId: string) => {
      const node = docNodes.find((n) => n.id === nodeId)
      if (node) setClipboardNode(node)
      setNodeMenu(null)
    },
    [docNodes],
  )

  const handleDuplicateFromMenu = useCallback(
    (nodeId: string) => {
      const newId = duplicateNode(activeSheetId, nodeId)
      if (newId) select({ kind: 'node', id: newId })
      setNodeMenu(null)
    },
    [activeSheetId, duplicateNode, select],
  )

  const handleDeleteFromMenu = useCallback(
    (nodeId: string) => {
      removeNode(activeSheetId, nodeId)
      setNodeMenu(null)
    },
    [activeSheetId, removeNode],
  )

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      select({ kind: 'node', id: node.id })
      setMenu(null)
      setNodeMenu(null)
      if (node.type === 'vlan') {
        const docNode = (node.data as { docNode?: VlanDocNode }).docNode
        setHighlightVlanId(docNode?.data.vlanId ?? 0)
      } else {
        setHighlightVlanId(null)
      }
    },
    [select, setHighlightVlanId],
  )

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      select({ kind: 'edge', id: edge.id })
      setMenu(null)
      setNodeMenu(null)
      setHighlightVlanId(null)
    },
    [select, setHighlightVlanId],
  )

  // React Flow's pane swallows the mousedown before it bubbles to `document`,
  // so PaneContextMenu's useClickOutside never sees clicks landing on the
  // canvas itself — close the menu explicitly from the pane's own click handler.
  const handlePaneClick = useCallback(() => {
    clearSelection()
    setMenu(null)
    setNodeMenu(null)
    setHighlightVlanId(null)
  }, [clearSelection, setHighlightVlanId])

  const handleConnect: OnConnect = useCallback(
    (connection) => onConnectStore(activeSheetId, connection),
    [activeSheetId, onConnectStore],
  )

  const handleNodeDragStart: OnNodeDrag = useCallback((_event, node) => {
    setDraggingNodeId(node.id)
    setMenu(null)
    setNodeMenu(null)
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
        assignNodeToGroup(activeSheetId, node.id, targetGroupId, { x: absX, y: absY })
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
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        snapToGrid={snapToGrid}
        snapGrid={SNAP_GRID}
        colorMode="dark"
        fitView
        fitViewOptions={{ maxZoom: 1 }}
      >
        <Background />
        <Controls>
          <ControlButton
            title={snapToGrid ? 'Disable snap to grid' : 'Enable snap to grid'}
            aria-label={snapToGrid ? 'Disable snap to grid' : 'Enable snap to grid'}
            className={snapToGrid ? 'react-flow__controls-button-active' : undefined}
            onClick={() => setSnapToGrid(!snapToGrid)}
          >
            <IconMagnet size={16} />
          </ControlButton>
        </Controls>
      </ReactFlow>
      <PaneContextMenu
        state={menu}
        onClose={() => setMenu(null)}
        onAddNode={handleAddNode}
        onPaste={clipboardNode ? handlePasteAt : undefined}
      />
      <NodeContextMenu
        state={nodeMenu}
        onClose={() => setNodeMenu(null)}
        onCopy={handleCopyFromMenu}
        onDuplicate={handleDuplicateFromMenu}
        onDelete={handleDeleteFromMenu}
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
