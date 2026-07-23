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
} from '@mantine/core'
import { IconPencil, IconCheck } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { GroupHeaderDocNode, GroupHeaderData } from '../fileformat/types'
import { GroupTypeIcon } from '../canvas/nodes/GroupTypeIcon'
import { GROUP_ICON_KEYS, GROUP_ICON_LABELS, type GroupIconKey } from '../canvas/nodes/groupIconMap'

interface GroupInspectorProps {
  node: GroupHeaderDocNode
}

export default function GroupInspector({ node }: GroupInspectorProps) {
  const [editing, setEditing] = useState(false)

  return (
    <Stack p="md" gap="sm">
      <Group justify="space-between">
        <Title order={5}>Group</Title>
        <ActionIcon
          variant="subtle"
          aria-label={editing ? 'Done editing' : 'Edit group'}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? <IconCheck size={16} /> : <IconPencil size={16} />}
        </ActionIcon>
      </Group>
      {editing ? <GroupEditForm node={node} /> : <GroupReadOnlyView node={node} />}
    </Stack>
  )
}

function GroupReadOnlyView({ node }: GroupInspectorProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <GroupTypeIcon icon={node.data.icon} size={20} />
        <Text fw={600}>{node.label}</Text>
      </Group>
      <Divider label="Description" labelPosition="left" />
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {node.description || (
          <Text component="span" c="dimmed">
            No description.
          </Text>
        )}
      </Text>
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete group
      </Button>
    </Stack>
  )
}

function GroupEditForm({ node }: GroupInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const removeNode = useDocumentStore((s) => s.removeNode)

  const setField = (field: keyof GroupHeaderData, value: GroupHeaderData[keyof GroupHeaderData]) => {
    updateNode(node.sheetId, node.id, { data: { ...node.data, [field]: value } })
  }

  return (
    <Stack gap="sm" key={node.id}>
      <TextInput
        label="Label"
        defaultValue={node.label}
        onBlur={(e) => updateNode(node.sheetId, node.id, { label: e.currentTarget.value })}
      />
      <Select
        label="Icon"
        data={GROUP_ICON_KEYS.map((value) => ({ value, label: GROUP_ICON_LABELS[value] }))}
        value={node.data.icon ?? null}
        onChange={(value) => setField('icon', (value ?? undefined) as GroupIconKey | undefined)}
        clearable
      />
      <Divider label="Description" labelPosition="left" />
      <Textarea
        placeholder="Markdown description..."
        minRows={6}
        autosize
        defaultValue={node.description ?? ''}
        onBlur={(e) => updateNode(node.sheetId, node.id, { description: e.currentTarget.value })}
      />
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete group
      </Button>
    </Stack>
  )
}
