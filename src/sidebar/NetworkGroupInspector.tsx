import { useState } from 'react'
import {
  Stack,
  TextInput,
  Title,
  Divider,
  Button,
  Group,
  ActionIcon,
  Text,
} from '@mantine/core'
import { IconPencil, IconCheck } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { NetworkGroupDocNode, NetworkGroupData } from '../fileformat/types'
import { NETWORK_GROUP_ICON } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'

interface NetworkGroupInspectorProps {
  node: NetworkGroupDocNode
}

export default function NetworkGroupInspector({ node }: NetworkGroupInspectorProps) {
  const [editing, setEditing] = useState(false)
  const Icon = NETWORK_GROUP_ICON

  return (
    <Stack p="md" gap="sm">
      <Group justify="space-between">
        <Title order={5}>Network Group</Title>
        <ActionIcon
          variant="subtle"
          aria-label={editing ? 'Done editing' : 'Edit network group'}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? <IconCheck size={16} /> : <IconPencil size={16} />}
        </ActionIcon>
      </Group>
      {editing ? (
        <NetworkGroupEditForm node={node} />
      ) : (
        <Stack gap="sm">
          <Group gap="xs">
            <Icon size={20} />
            <Text fw={600}>{node.label}</Text>
          </Group>
          <div>
            <Text size="xs" c="dimmed">
              CIDR
            </Text>
            <Text size="sm">{node.data.cidr || <Text component="span" c="dimmed">Not set</Text>}</Text>
          </div>
          <Divider label="Description" labelPosition="left" />
          {node.description ? (
            <MarkdownRenderer content={node.description} />
          ) : (
            <Text size="sm" c="dimmed">
              No description.
            </Text>
          )}
          <DeleteButton node={node} />
        </Stack>
      )}
    </Stack>
  )
}

function DeleteButton({ node }: NetworkGroupInspectorProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  return (
    <>
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete network group
      </Button>
    </>
  )
}

function NetworkGroupEditForm({ node }: NetworkGroupInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)

  const setField = (field: keyof NetworkGroupData, value: NetworkGroupData[keyof NetworkGroupData]) => {
    updateNode(node.sheetId, node.id, { data: { ...node.data, [field]: value } })
  }

  return (
    <Stack gap="sm" key={node.id}>
      <TextInput
        label="Label"
        defaultValue={node.label}
        onBlur={(e) => updateNode(node.sheetId, node.id, { label: e.currentTarget.value })}
      />
      <TextInput
        label="CIDR"
        placeholder="10.0.0.0/24"
        defaultValue={node.data.cidr ?? ''}
        onBlur={(e) => setField('cidr', e.currentTarget.value)}
      />
      <Divider label="Description" labelPosition="left" />
      <MarkdownEditor
        value={node.description ?? ''}
        onCommit={(value) => updateNode(node.sheetId, node.id, { description: value })}
      />
      <DeleteButton node={node} />
    </Stack>
  )
}
