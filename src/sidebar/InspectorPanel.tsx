import { Stack, Text } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import DeviceInspector from './DeviceInspector'
import EdgeInspector from './EdgeInspector'
import GroupInspector from './GroupInspector'

export default function InspectorPanel() {
  const activeSheetId = useDocumentStore((s) => s.activeSheetId)
  const selection = useDocumentStore((s) => s.selection)
  const nodes = useDocumentStore((s) => s.nodesBySheet[activeSheetId] ?? [])
  const edges = useDocumentStore((s) => s.edgesBySheet[activeSheetId] ?? [])

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

  const node = nodes.find((n) => n.id === selection.id)
  if (!node) return null

  switch (node.type) {
    case 'device':
      return <DeviceInspector key={node.id} node={node} />
    case 'group_header':
      return <GroupInspector key={node.id} node={node} />
    default:
      return (
        <Stack p="md">
          <Text size="sm" c="dimmed">
            Inspector for "{node.type}" nodes is coming soon.
          </Text>
        </Stack>
      )
  }
}
