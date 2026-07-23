import { useState } from 'react'
import {
  Stack,
  TextInput,
  Select,
  Textarea,
  Title,
  Divider,
  Button,
  Group,
  ActionIcon,
  Text,
  Badge,
} from '@mantine/core'
import { IconPencil, IconCheck } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { DocEdge, EdgeType } from '../fileformat/types'
import { EDGE_TYPE_ICONS, EDGE_TYPE_LABELS } from '../canvas/edges/edgeTypeMeta'

const EDGE_TYPES: EdgeType[] = ['physical_link', 'logical_link', 'vlan_membership', 'vpn_tunnel']

interface EdgeInspectorProps {
  edge: DocEdge
}

export default function EdgeInspector({ edge }: EdgeInspectorProps) {
  const [editing, setEditing] = useState(false)

  return (
    <Stack p="md" gap="sm">
      <Group justify="space-between">
        <Title order={5}>Connection</Title>
        <ActionIcon
          variant="subtle"
          aria-label={editing ? 'Done editing' : 'Edit connection'}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? <IconCheck size={16} /> : <IconPencil size={16} />}
        </ActionIcon>
      </Group>
      {editing ? <EdgeEditForm edge={edge} /> : <EdgeReadOnlyView edge={edge} />}
    </Stack>
  )
}

function FieldRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value || <Text component="span" c="dimmed">Not set</Text>}</Text>
    </div>
  )
}

function EdgeReadOnlyView({ edge }: EdgeInspectorProps) {
  const removeEdge = useDocumentStore((s) => s.removeEdge)
  const Icon = EDGE_TYPE_ICONS[edge.type]

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <Icon size={20} />
        <Text fw={600}>{edge.label || EDGE_TYPE_LABELS[edge.type]}</Text>
        <Badge size="xs" variant="light">
          {EDGE_TYPE_LABELS[edge.type]}
        </Badge>
      </Group>
      <FieldRow label="Label" value={edge.label} />
      <Divider label="Description" labelPosition="left" />
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {edge.description || (
          <Text component="span" c="dimmed">
            No description.
          </Text>
        )}
      </Text>
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeEdge(edge.sheetId, edge.id)}>
        Delete connection
      </Button>
    </Stack>
  )
}

function EdgeEditForm({ edge }: EdgeInspectorProps) {
  const updateEdge = useDocumentStore((s) => s.updateEdge)
  const removeEdge = useDocumentStore((s) => s.removeEdge)

  return (
    <Stack gap="sm" key={edge.id}>
      <Select
        label="Type"
        data={EDGE_TYPES.map((value) => ({ value, label: EDGE_TYPE_LABELS[value] }))}
        value={edge.type}
        onChange={(value) => value && updateEdge(edge.sheetId, edge.id, { type: value as EdgeType })}
        allowDeselect={false}
      />
      <TextInput
        label="Label"
        defaultValue={edge.label ?? ''}
        onBlur={(e) => updateEdge(edge.sheetId, edge.id, { label: e.currentTarget.value })}
      />
      <Divider label="Description" labelPosition="left" />
      <Textarea
        placeholder="Markdown description..."
        minRows={6}
        autosize
        defaultValue={edge.description ?? ''}
        onBlur={(e) => updateEdge(edge.sheetId, edge.id, { description: e.currentTarget.value })}
      />
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeEdge(edge.sheetId, edge.id)}>
        Delete connection
      </Button>
    </Stack>
  )
}
