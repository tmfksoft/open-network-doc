import { useState } from 'react'
import {
  Stack,
  TextInput,
  Select,
  Title,
  Divider,
  Button,
  Group,
  ActionIcon,
  Text,
} from '@mantine/core'
import { IconPencil, IconCheck } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { SheetPortalDocNode, SheetPortalData } from '../fileformat/types'
import { SHEET_PORTAL_ICON } from '../canvas/nodes/nodeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'

interface SheetPortalInspectorProps {
  node: SheetPortalDocNode
}

export default function SheetPortalInspector({ node }: SheetPortalInspectorProps) {
  const [editing, setEditing] = useState(false)
  const Icon = SHEET_PORTAL_ICON
  const sheets = useDocumentStore((s) => s.sheets)
  const targetSheet = sheets.find((s) => s.id === node.data.targetSheetId)

  return (
    <Stack p="md" gap="sm">
      <Group justify="space-between">
        <Title order={5}>Sheet Link</Title>
        <ActionIcon
          variant="subtle"
          aria-label={editing ? 'Done editing' : 'Edit sheet link'}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? <IconCheck size={16} /> : <IconPencil size={16} />}
        </ActionIcon>
      </Group>
      {editing ? (
        <SheetPortalEditForm node={node} />
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

function SheetPortalEditForm({ node }: SheetPortalInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const sheets = useDocumentStore((s) => s.sheets)
  const nodesBySheet = useDocumentStore((s) => s.nodesBySheet)

  const setField = (field: keyof SheetPortalData, value: SheetPortalData[keyof SheetPortalData]) => {
    updateNode(node.sheetId, node.id, { data: { ...node.data, [field]: value } })
  }

  const otherSheets = sheets.filter((s) => s.id !== node.sheetId)
  const targetNodes = node.data.targetSheetId ? (nodesBySheet[node.data.targetSheetId] ?? []) : []

  return (
    <Stack gap="sm" key={node.id}>
      <TextInput
        label="Label"
        defaultValue={node.label}
        onBlur={(e) => updateNode(node.sheetId, node.id, { label: e.currentTarget.value })}
      />
      <Select
        label="Target sheet"
        placeholder="Choose a sheet"
        data={otherSheets.map((s) => ({ value: s.id, label: s.name }))}
        value={node.data.targetSheetId ?? null}
        onChange={(value) =>
          updateNode(node.sheetId, node.id, {
            data: { ...node.data, targetSheetId: value ?? undefined, targetNodeId: undefined },
          })
        }
        clearable
      />
      <Select
        label="Focus on element (optional)"
        placeholder="Whole sheet"
        searchable
        disabled={!node.data.targetSheetId}
        data={targetNodes.map((n) => ({ value: n.id, label: n.label }))}
        value={node.data.targetNodeId ?? null}
        onChange={(value) => setField('targetNodeId', value ?? undefined)}
        clearable
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
