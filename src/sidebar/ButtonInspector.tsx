import { useState } from 'react'
import { Stack, TextInput, Select, Divider, Button, Group, Text } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import type { ButtonDocNode, ButtonData, ButtonLinkType } from '../fileformat/types'
import { BUTTON_LINK_TYPE_ICONS, BUTTON_LINK_TYPE_LABELS } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'
import { ColorFieldsReadView, ColorFieldsEditForm } from '../components/NodeColorFields'

const LINK_TYPES: ButtonLinkType[] = ['website', 'sheet', 'kb_article']

interface ButtonInspectorProps {
  node: ButtonDocNode
}

interface Draft {
  label: string
  description: string
  data: ButtonData
}

function toDraft(node: ButtonDocNode): Draft {
  return { label: node.label, description: node.description ?? '', data: { ...node.data } }
}

export default function ButtonInspector({ node }: ButtonInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => toDraft(node))

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
        title="Button"
        editing={editing}
        editLabel="Edit button"
        onEdit={startEdit}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
      {editing ? (
        <ButtonEditForm node={node} draft={draft} setDraft={setDraft} />
      ) : (
        <ButtonReadOnlyView node={node} />
      )}
    </Stack>
  )
}

function LinkTarget({ node }: ButtonInspectorProps) {
  const sheets = useDocumentStore((s) => s.sheets)
  const kbPages = useDocumentStore((s) => s.kbPages)
  const { linkType, url, targetSheetId, targetKbPageId } = node.data

  if (linkType === 'website') {
    return <Text size="sm">{url || <Text component="span" c="dimmed">Not set</Text>}</Text>
  }
  if (linkType === 'sheet') {
    const sheet = sheets.find((s) => s.id === targetSheetId)
    return <Text size="sm">{sheet?.name || <Text component="span" c="dimmed">Not set</Text>}</Text>
  }
  if (linkType === 'kb_article') {
    const page = kbPages.find((p) => p.id === targetKbPageId)
    return <Text size="sm">{page?.title || <Text component="span" c="dimmed">Not set</Text>}</Text>
  }
  return (
    <Text size="sm" c="dimmed">
      Not set
    </Text>
  )
}

function ButtonReadOnlyView({ node }: ButtonInspectorProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  const Icon = node.data.linkType ? BUTTON_LINK_TYPE_ICONS[node.data.linkType] : undefined

  return (
    <Stack gap="sm">
      <Group gap="xs">
        {Icon && <Icon size={20} />}
        <Text fw={600}>{node.label}</Text>
      </Group>
      <Group grow>
        <div>
          <Text size="xs" c="dimmed">
            Link type
          </Text>
          <Text size="sm">{node.data.linkType ? BUTTON_LINK_TYPE_LABELS[node.data.linkType] : 'Not set'}</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">
            Target
          </Text>
          <LinkTarget node={node} />
        </div>
      </Group>
      <ColorFieldsReadView backgroundColor={node.data.backgroundColor} borderColor={node.data.borderColor} />
      <Divider label="Description" labelPosition="left" />
      {node.description ? (
        <MarkdownRenderer content={node.description} />
      ) : (
        <Text size="sm" c="dimmed">
          No description.
        </Text>
      )}
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete button
      </Button>
    </Stack>
  )
}

interface ButtonEditFormProps {
  node: ButtonDocNode
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
}

function ButtonEditForm({ node, draft, setDraft }: ButtonEditFormProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  const sheets = useDocumentStore((s) => s.sheets)
  const kbPages = useDocumentStore((s) => s.kbPages)

  const setField = (field: keyof ButtonData, value: ButtonData[keyof ButtonData]) => {
    setDraft((d) => ({ ...d, data: { ...d.data, [field]: value } }))
  }

  const otherSheets = sheets.filter((s) => s.id !== node.sheetId)

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
        label="Link type"
        data={LINK_TYPES.map((value) => ({ value, label: BUTTON_LINK_TYPE_LABELS[value] }))}
        value={draft.data.linkType ?? null}
        onChange={(value) => setField('linkType', (value ?? undefined) as ButtonLinkType | undefined)}
        clearable
      />
      {draft.data.linkType === 'website' && (
        <TextInput
          label="URL"
          placeholder="https://example.com"
          value={draft.data.url ?? ''}
          onChange={(e) => setField('url', e.currentTarget.value)}
        />
      )}
      {draft.data.linkType === 'sheet' && (
        <Select
          label="Target sheet"
          placeholder="Choose a sheet"
          data={otherSheets.map((s) => ({ value: s.id, label: s.name }))}
          value={draft.data.targetSheetId ?? null}
          onChange={(value) => setField('targetSheetId', value ?? undefined)}
          clearable
        />
      )}
      {draft.data.linkType === 'kb_article' && (
        <Select
          label="Target KB article"
          placeholder="Choose a page"
          searchable
          data={kbPages.map((p) => ({ value: p.id, label: p.title }))}
          value={draft.data.targetKbPageId ?? null}
          onChange={(value) => setField('targetKbPageId', value ?? undefined)}
          nothingFoundMessage="No matching pages"
          clearable
        />
      )}
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
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete button
      </Button>
    </Stack>
  )
}
