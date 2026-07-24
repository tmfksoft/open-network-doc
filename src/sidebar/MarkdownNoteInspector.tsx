import { useState } from 'react'
import { Stack, TextInput, Divider, Button, Group, Text } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import type { MarkdownNoteDocNode } from '../fileformat/types'
import { MARKDOWN_NOTE_ICON } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'

interface MarkdownNoteInspectorProps {
  node: MarkdownNoteDocNode
}

interface Draft {
  label: string
  description: string
}

function toDraft(node: MarkdownNoteDocNode): Draft {
  return { label: node.label, description: node.description ?? '' }
}

export default function MarkdownNoteInspector({ node }: MarkdownNoteInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => toDraft(node))
  const Icon = MARKDOWN_NOTE_ICON

  const startEdit = () => {
    setDraft(toDraft(node))
    setEditing(true)
  }
  const save = () => {
    updateNode(node.sheetId, node.id, { label: draft.label, description: draft.description })
    setEditing(false)
  }

  return (
    <Stack p="md" gap="sm">
      <InspectorHeader
        title="Markdown Note"
        editing={editing}
        editLabel="Edit note"
        onEdit={startEdit}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
      {editing ? (
        <MarkdownNoteEditForm node={node} draft={draft} setDraft={setDraft} />
      ) : (
        <Stack gap="sm">
          <Group gap="xs">
            <Icon size={20} />
            <Text fw={600}>{node.label}</Text>
          </Group>
          <Divider />
          {node.description ? (
            <MarkdownRenderer content={node.description} />
          ) : (
            <Text size="sm" c="dimmed">
              Empty note.
            </Text>
          )}
          <DeleteButton node={node} />
        </Stack>
      )}
    </Stack>
  )
}

function DeleteButton({ node }: MarkdownNoteInspectorProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  return (
    <>
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete note
      </Button>
    </>
  )
}

interface MarkdownNoteEditFormProps {
  node: MarkdownNoteDocNode
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
}

function MarkdownNoteEditForm({ node, draft, setDraft }: MarkdownNoteEditFormProps) {
  return (
    <Stack gap="sm" key={node.id}>
      <TextInput
        label="Label"
        description="Internal name only — not shown on the note itself"
        value={draft.label}
        onChange={(e) => {
          const value = e.currentTarget.value
          setDraft((d) => ({ ...d, label: value }))
        }}
      />
      <Divider label="Content" labelPosition="left" />
      <MarkdownEditor
        value={draft.description}
        onCommit={(value) => setDraft((d) => ({ ...d, description: value }))}
      />
      <DeleteButton node={node} />
    </Stack>
  )
}
