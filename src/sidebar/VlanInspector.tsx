import { useState } from 'react'
import {
  Stack,
  TextInput,
  NumberInput,
  Title,
  Divider,
  Button,
  Group,
  ActionIcon,
  Text,
} from '@mantine/core'
import { IconPencil, IconCheck } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { VlanDocNode, VlanData } from '../fileformat/types'
import { VLAN_ICON } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'

interface VlanInspectorProps {
  node: VlanDocNode
}

export default function VlanInspector({ node }: VlanInspectorProps) {
  const [editing, setEditing] = useState(false)
  const Icon = VLAN_ICON

  return (
    <Stack p="md" gap="sm">
      <Group justify="space-between">
        <Title order={5}>VLAN</Title>
        <ActionIcon
          variant="subtle"
          aria-label={editing ? 'Done editing' : 'Edit VLAN'}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? <IconCheck size={16} /> : <IconPencil size={16} />}
        </ActionIcon>
      </Group>
      {editing ? (
        <VlanEditForm node={node} />
      ) : (
        <Stack gap="sm">
          <Group gap="xs">
            <Icon size={20} />
            <Text fw={600}>{node.label}</Text>
          </Group>
          <div>
            <Text size="xs" c="dimmed">
              VLAN ID
            </Text>
            <Text size="sm">
              {node.data.vlanId ?? <Text component="span" c="dimmed">Not set</Text>}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              VLAN Name
            </Text>
            <Text size="sm">
              {node.data.vlanName || <Text component="span" c="dimmed">Not set</Text>}
            </Text>
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

function DeleteButton({ node }: VlanInspectorProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  return (
    <>
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete VLAN
      </Button>
    </>
  )
}

function VlanEditForm({ node }: VlanInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)

  const setField = (field: keyof VlanData, value: VlanData[keyof VlanData]) => {
    updateNode(node.sheetId, node.id, { data: { ...node.data, [field]: value } })
  }

  return (
    <Stack gap="sm" key={node.id}>
      <TextInput
        label="Label"
        defaultValue={node.label}
        onBlur={(e) => updateNode(node.sheetId, node.id, { label: e.currentTarget.value })}
      />
      <NumberInput
        label="VLAN ID"
        placeholder="100"
        min={1}
        max={4094}
        defaultValue={node.data.vlanId}
        onBlur={(e) => setField('vlanId', e.currentTarget.value ? Number(e.currentTarget.value) : undefined)}
      />
      <TextInput
        label="VLAN Name"
        defaultValue={node.data.vlanName ?? ''}
        onBlur={(e) => setField('vlanName', e.currentTarget.value)}
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
