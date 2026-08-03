import { useState } from 'react'
import {
  Stack,
  TextInput,
  Divider,
  Button,
  Group,
  Text,
  SimpleGrid,
} from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import type { IpRangeDocNode, IpRangeData } from '../fileformat/types'
import { IP_RANGE_ICON } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'

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

interface Draft {
  label: string
  description: string
  data: IpRangeData
}

function toDraft(node: IpRangeDocNode): Draft {
  return { label: node.label, description: node.description ?? '', data: { ...node.data } }
}

export default function IpRangeInspector({ node }: IpRangeInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => toDraft(node))
  const Icon = IP_RANGE_ICON

  const startEdit = () => {
    setDraft(toDraft(node))
    setEditing(true)
  }
  const save = () => {
    updateNode(node.sheetId, node.id, { label: draft.label, description: draft.description, data: draft.data })
    setEditing(false)
  }

  return (
    <Stack p="md" gap="sm">
      <InspectorHeader
        title="IP Range"
        editing={editing}
        editLabel="Edit IP range"
        onEdit={startEdit}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
      {editing ? (
        <IpRangeEditForm node={node} draft={draft} setDraft={setDraft} />
      ) : (
        <Stack gap="sm">
          <Group gap="xs">
            <Icon size={20} />
            <Text fw={600}>{node.label}</Text>
          </Group>
          <SimpleGrid cols={2} spacing="sm">
            <FieldRow label="Range start" value={node.data.rangeStart} />
            <FieldRow label="Range end" value={node.data.rangeEnd} />
            <FieldRow label="CIDR" value={node.data.cidr} />
            <FieldRow label="Purpose" value={node.data.purpose} />
          </SimpleGrid>
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

interface IpRangeEditFormProps {
  node: IpRangeDocNode
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
}

function IpRangeEditForm({ node, draft, setDraft }: IpRangeEditFormProps) {
  const setField = (field: keyof IpRangeData, value: IpRangeData[keyof IpRangeData]) => {
    setDraft((d) => ({ ...d, data: { ...d.data, [field]: value } }))
  }

  return (
    <Stack gap="sm" key={node.id}>
      <TextInput
        label="Label"
        value={draft.label}
        onChange={(e) => {
          const value = e.currentTarget.value
          setDraft((d) => ({ ...d, label: value }))
        }}
      />
      <SimpleGrid cols={2} spacing="sm">
        <TextInput
          label="Range start"
          placeholder="10.0.0.10"
          value={draft.data.rangeStart ?? ''}
          onChange={(e) => setField('rangeStart', e.currentTarget.value)}
        />
        <TextInput
          label="Range end"
          placeholder="10.0.0.200"
          value={draft.data.rangeEnd ?? ''}
          onChange={(e) => setField('rangeEnd', e.currentTarget.value)}
        />
        <TextInput
          label="CIDR"
          placeholder="10.0.0.0/24"
          value={draft.data.cidr ?? ''}
          onChange={(e) => setField('cidr', e.currentTarget.value)}
        />
        <TextInput
          label="Purpose"
          placeholder="DHCP scope"
          value={draft.data.purpose ?? ''}
          onChange={(e) => setField('purpose', e.currentTarget.value)}
        />
      </SimpleGrid>
      <Divider label="Description" labelPosition="left" />
      <MarkdownEditor
        value={draft.description}
        onCommit={(value) => setDraft((d) => ({ ...d, description: value }))}
      />
      <DeleteButton node={node} />
    </Stack>
  )
}
