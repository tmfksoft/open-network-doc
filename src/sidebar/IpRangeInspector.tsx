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
import type { IpRangeDocNode, IpRangeData } from '../fileformat/types'
import { IP_RANGE_ICON } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'

interface IpRangeInspectorProps {
  node: IpRangeDocNode
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

export default function IpRangeInspector({ node }: IpRangeInspectorProps) {
  const [editing, setEditing] = useState(false)
  const Icon = IP_RANGE_ICON

  return (
    <Stack p="md" gap="sm">
      <Group justify="space-between">
        <Title order={5}>IP Range</Title>
        <ActionIcon
          variant="subtle"
          aria-label={editing ? 'Done editing' : 'Edit IP range'}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? <IconCheck size={16} /> : <IconPencil size={16} />}
        </ActionIcon>
      </Group>
      {editing ? (
        <IpRangeEditForm node={node} />
      ) : (
        <Stack gap="sm">
          <Group gap="xs">
            <Icon size={20} />
            <Text fw={600}>{node.label}</Text>
          </Group>
          <FieldRow label="Range start" value={node.data.rangeStart} />
          <FieldRow label="Range end" value={node.data.rangeEnd} />
          <FieldRow label="CIDR" value={node.data.cidr} />
          <FieldRow label="Purpose" value={node.data.purpose} />
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

function DeleteButton({ node }: IpRangeInspectorProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  return (
    <>
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete IP range
      </Button>
    </>
  )
}

function IpRangeEditForm({ node }: IpRangeInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)

  const setField = (field: keyof IpRangeData, value: IpRangeData[keyof IpRangeData]) => {
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
        label="Range start"
        placeholder="10.0.0.10"
        defaultValue={node.data.rangeStart ?? ''}
        onBlur={(e) => setField('rangeStart', e.currentTarget.value)}
      />
      <TextInput
        label="Range end"
        placeholder="10.0.0.200"
        defaultValue={node.data.rangeEnd ?? ''}
        onBlur={(e) => setField('rangeEnd', e.currentTarget.value)}
      />
      <TextInput
        label="CIDR"
        placeholder="10.0.0.0/24"
        defaultValue={node.data.cidr ?? ''}
        onBlur={(e) => setField('cidr', e.currentTarget.value)}
      />
      <TextInput
        label="Purpose"
        placeholder="DHCP scope"
        defaultValue={node.data.purpose ?? ''}
        onBlur={(e) => setField('purpose', e.currentTarget.value)}
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
