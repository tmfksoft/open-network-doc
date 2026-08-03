import { useState } from 'react'
import {
  Stack,
  TextInput,
  NumberInput,
  Divider,
  Button,
  Group,
  Text,
  SimpleGrid,
} from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import type { VlanDocNode, VlanData } from '../fileformat/types'
import { VLAN_ICON } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'

interface VlanInspectorProps {
  node: VlanDocNode
}

interface Draft {
  label: string
  description: string
  data: VlanData
}

function toDraft(node: VlanDocNode): Draft {
  return { label: node.label, description: node.description ?? '', data: { ...node.data } }
}

export default function VlanInspector({ node }: VlanInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => toDraft(node))
  const Icon = VLAN_ICON

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
        title="VLAN"
        editing={editing}
        editLabel="Edit VLAN"
        onEdit={startEdit}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
      {editing ? (
        <VlanEditForm node={node} draft={draft} setDraft={setDraft} />
      ) : (
        <Stack gap="sm">
          <Group gap="xs">
            <Icon size={20} />
            <Text fw={600}>{node.label}</Text>
          </Group>
          <SimpleGrid cols={2} spacing="sm">
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

interface VlanEditFormProps {
  node: VlanDocNode
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
}

function VlanEditForm({ node, draft, setDraft }: VlanEditFormProps) {
  const setField = (field: keyof VlanData, value: VlanData[keyof VlanData]) => {
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
        <NumberInput
          label="VLAN ID"
          placeholder="100"
          min={1}
          max={4094}
          value={draft.data.vlanId}
          onChange={(value) => setField('vlanId', value === '' ? undefined : Number(value))}
        />
        <TextInput
          label="VLAN Name"
          value={draft.data.vlanName ?? ''}
          onChange={(e) => setField('vlanName', e.currentTarget.value)}
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
