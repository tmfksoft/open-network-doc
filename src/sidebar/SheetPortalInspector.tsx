import { useState } from 'react'
import {
  Stack,
  TextInput,
  Select,
  Divider,
  Button,
  Group,
  Text,
} from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import type { SheetPortalDocNode, SheetPortalData } from '../fileformat/types'
import { SHEET_PORTAL_ICON } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'

interface SheetPortalInspectorProps {
  node: SheetPortalDocNode
}

interface Draft {
  label: string
  description: string
  data: SheetPortalData
}

function toDraft(node: SheetPortalDocNode): Draft {
  return { label: node.label, description: node.description ?? '', data: { ...node.data } }
}

export default function SheetPortalInspector({ node }: SheetPortalInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => toDraft(node))
  const Icon = SHEET_PORTAL_ICON
  const sheets = useDocumentStore((s) => s.sheets)
  const targetSheet = sheets.find((s) => s.id === node.data.targetSheetId)

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
        title="Sheet Link"
        editing={editing}
        editLabel="Edit sheet link"
        onEdit={startEdit}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
      {editing ? (
        <SheetPortalEditForm node={node} draft={draft} setDraft={setDraft} />
      ) : (
        <Stack gap="sm">
          <Group gap="xs">
            <Icon size={20} />
            <Text fw={600}>{node.label}</Text>
          </Group>
          <div>
            <Text size="xs" c="dimmed">
              Target sheet
            </Text>
            <Text size="sm">
              {targetSheet?.name || <Text component="span" c="dimmed">Not linked</Text>}
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

function DeleteButton({ node }: SheetPortalInspectorProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  return (
    <>
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete sheet link
      </Button>
    </>
  )
}

interface SheetPortalEditFormProps {
  node: SheetPortalDocNode
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
}

function SheetPortalEditForm({ node, draft, setDraft }: SheetPortalEditFormProps) {
  const sheets = useDocumentStore((s) => s.sheets)
  const nodesBySheet = useDocumentStore((s) => s.nodesBySheet)

  const setField = (field: keyof SheetPortalData, value: SheetPortalData[keyof SheetPortalData]) => {
    setDraft((d) => ({ ...d, data: { ...d.data, [field]: value } }))
  }

  const otherSheets = sheets.filter((s) => s.id !== node.sheetId)
  const targetNodes = draft.data.targetSheetId ? (nodesBySheet[draft.data.targetSheetId] ?? []) : []

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
      <Select
        label="Target sheet"
        placeholder="Choose a sheet"
        data={otherSheets.map((s) => ({ value: s.id, label: s.name }))}
        value={draft.data.targetSheetId ?? null}
        onChange={(value) =>
          setDraft((d) => ({ ...d, data: { ...d.data, targetSheetId: value ?? undefined, targetNodeId: undefined } }))
        }
        clearable
      />
      <Select
        label="Focus on element (optional)"
        placeholder="Whole sheet"
        searchable
        disabled={!draft.data.targetSheetId}
        data={targetNodes.map((n) => ({ value: n.id, label: n.label }))}
        value={draft.data.targetNodeId ?? null}
        onChange={(value) => setField('targetNodeId', value ?? undefined)}
        clearable
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
