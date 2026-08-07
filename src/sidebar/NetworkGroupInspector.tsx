import { useState } from 'react'
import {
  Stack,
  TextInput,
  Divider,
  Button,
  Group,
  Text,
} from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import type { NetworkGroupDocNode, NetworkGroupData } from '../fileformat/types'
import { networkGroupIcon } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'
import { ColorFieldsReadView, ColorFieldsEditForm } from '../components/NodeColorFields'

interface NetworkGroupInspectorProps {
  node: NetworkGroupDocNode
}

interface Draft {
  label: string
  description: string
  data: NetworkGroupData
}

function toDraft(node: NetworkGroupDocNode): Draft {
  return { label: node.label, description: node.description ?? '', data: { ...node.data } }
}

export default function NetworkGroupInspector({ node }: NetworkGroupInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => toDraft(node))
  const Icon = networkGroupIcon(node.label)

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
        title="Network Group"
        editing={editing}
        editLabel="Edit network group"
        onEdit={startEdit}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
      {editing ? (
        <NetworkGroupEditForm node={node} draft={draft} setDraft={setDraft} />
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
          <ColorFieldsReadView backgroundColor={node.data.backgroundColor} borderColor={node.data.borderColor} />
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

interface NetworkGroupEditFormProps {
  node: NetworkGroupDocNode
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
}

function NetworkGroupEditForm({ node, draft, setDraft }: NetworkGroupEditFormProps) {
  const setField = (field: keyof NetworkGroupData, value: NetworkGroupData[keyof NetworkGroupData]) => {
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
      <TextInput
        label="CIDR"
        placeholder="10.0.0.0/24"
        value={draft.data.cidr ?? ''}
        onChange={(e) => setField('cidr', e.currentTarget.value)}
      />
      <ColorFieldsEditForm
        backgroundColor={draft.data.backgroundColor}
        borderColor={draft.data.borderColor}
        onBackgroundChange={(value) => setField('backgroundColor', value)}
        onBorderChange={(value) => setField('borderColor', value)}
      />
      <Divider label="Description" labelPosition="left" />
      <MarkdownEditor
        value={draft.description}
        onCommit={(value) => setDraft((d) => ({ ...d, description: value }))}
      />
      <DeleteButton node={node} />
    </Stack>
  )
}
