import { Stack, Text, Button } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import DeviceInspector from './DeviceInspector'
import EdgeInspector from './EdgeInspector'
import GroupInspector from './GroupInspector'
import NetworkGroupInspector from './NetworkGroupInspector'
import VlanInspector from './VlanInspector'
import IpRangeInspector from './IpRangeInspector'
import SheetPortalInspector from './SheetPortalInspector'
import MarkdownNoteInspector from './MarkdownNoteInspector'
import ButtonInspector from './ButtonInspector'

export default function InspectorPanel() {
  const activeSheetId = useDocumentStore((s) => s.activeSheetId)
  const selection = useDocumentStore((s) => s.selection)
  const nodes = useDocumentStore((s) => s.nodesBySheet[activeSheetId] ?? [])
  const edges = useDocumentStore((s) => s.edgesBySheet[activeSheetId] ?? [])
  const removeNode = useDocumentStore((s) => s.removeNode)

  if (!selection) {
    return (
      <Stack p="md">
        <Text size="sm" c="dimmed">
          Select an element on the canvas to view and edit its details.
        </Text>
      </Stack>
    )
  }

  if (selection.kind === 'edge') {
    const edge = edges.find((e) => e.id === selection.id)
    if (!edge) return null
    return <EdgeInspector key={edge.id} edge={edge} />
  }

  if (selection.ids.length > 1) {
    const ids = selection.ids
    return (
      <Stack p="md" gap="sm">
        <Text size="sm" fw={600}>
          {ids.length} nodes selected
        </Text>
        <Text size="xs" c="dimmed">
          Ctrl/Shift-click a node to add or remove it from the selection, or drag any of them to move the whole group.
        </Text>
        <Button
          color="red"
          variant="outline"
          leftSection={<IconTrash size={16} />}
          onClick={() => ids.forEach((id) => removeNode(activeSheetId, id))}
        >
          Delete {ids.length} nodes
        </Button>
      </Stack>
    )
  }

  const node = nodes.find((n) => n.id === selection.ids[0])
  if (!node) return null

  switch (node.type) {
    case 'device':
      return <DeviceInspector key={node.id} node={node} />
    case 'group_header':
      return <GroupInspector key={node.id} node={node} />
    case 'network_group':
      return <NetworkGroupInspector key={node.id} node={node} />
    case 'vlan':
      return <VlanInspector key={node.id} node={node} />
    case 'ip_range':
      return <IpRangeInspector key={node.id} node={node} />
    case 'sheet_portal':
      return <SheetPortalInspector key={node.id} node={node} />
    case 'markdown':
      return <MarkdownNoteInspector key={node.id} node={node} />
    case 'button':
      return <ButtonInspector key={node.id} node={node} />
  }
}
