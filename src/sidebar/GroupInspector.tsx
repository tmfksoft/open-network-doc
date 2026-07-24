import { useRef, useState } from 'react'
import {
  Stack,
  TextInput,
  Select,
  Checkbox,
  ColorInput,
  ColorSwatch,
  Divider,
  Button,
  Group,
  ActionIcon,
  Text,
} from '@mantine/core'
import { IconUpload, IconX } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { GroupHeaderDocNode, GroupHeaderData } from '../fileformat/types'
import GroupHeaderIcon from '../canvas/nodes/GroupHeaderIcon'
import { GROUP_ICON_KEYS, GROUP_ICON_LABELS, type GroupIconKey } from '../canvas/nodes/groupIconMap'
import { registerAsset } from '../assets-runtime/assetStore'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'

const GROUP_COLOR_SWATCHES = [
  '#e03131',
  '#f08c00',
  '#2f9e44',
  '#1971c2',
  '#7048e8',
  '#e64980',
  '#495057',
]

interface GroupInspectorProps {
  node: GroupHeaderDocNode
}

interface Draft {
  label: string
  description: string
  data: GroupHeaderData
}

function toDraft(node: GroupHeaderDocNode): Draft {
  return { label: node.label, description: node.description ?? '', data: { ...node.data } }
}

export default function GroupInspector({ node }: GroupInspectorProps) {
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
        title="Group"
        editing={editing}
        editLabel="Edit group"
        onEdit={startEdit}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
      {editing ? (
        <GroupEditForm node={node} draft={draft} setDraft={setDraft} />
      ) : (
        <GroupReadOnlyView node={node} />
      )}
    </Stack>
  )
}

function GroupReadOnlyView({ node }: GroupInspectorProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <GroupHeaderIcon icon={node.data.icon} logoAssetId={node.data.logoAssetId} size={24} />
        <Text fw={600}>{node.label}</Text>
      </Group>
      <Group grow>
        <div>
          <Text size="xs" c="dimmed">
            Background
          </Text>
          {node.data.backgroundColor ? (
            <Group gap={6} mt={2}>
              <ColorSwatch color={node.data.backgroundColor} size={16} />
              <Text size="sm">{node.data.backgroundColor}</Text>
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              Default
            </Text>
          )}
        </div>
        <div>
          <Text size="xs" c="dimmed">
            Border
          </Text>
          {node.data.borderColor ? (
            <Group gap={6} mt={2}>
              <ColorSwatch color={node.data.borderColor} size={16} />
              <Text size="sm">{node.data.borderColor}</Text>
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              Default
            </Text>
          )}
        </div>
      </Group>
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
        Delete group
      </Button>
    </Stack>
  )
}

interface GroupEditFormProps {
  node: GroupHeaderDocNode
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
}

function GroupEditForm({ node, draft, setDraft }: GroupEditFormProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setField = (field: keyof GroupHeaderData, value: GroupHeaderData[keyof GroupHeaderData]) => {
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

      <div>
        <Text size="sm" fw={500} mb={4}>
          Logo
        </Text>
        <Group gap="xs">
          <GroupHeaderIcon icon={draft.data.icon} logoAssetId={draft.data.logoAssetId} size={36} />
          <Button
            size="xs"
            variant="default"
            leftSection={<IconUpload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload logo
          </Button>
          {draft.data.logoAssetId && (
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label="Remove logo"
              onClick={() => setField('logoAssetId', undefined)}
            >
              <IconX size={14} />
            </ActionIcon>
          )}
        </Group>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) setField('logoAssetId', registerAsset(file))
          }}
        />
      </div>

      {!draft.data.logoAssetId && (
        <Select
          label="Icon"
          data={GROUP_ICON_KEYS.map((value) => ({ value, label: GROUP_ICON_LABELS[value] }))}
          value={draft.data.icon ?? null}
          onChange={(value) => setField('icon', (value ?? undefined) as GroupIconKey | undefined)}
          clearable
        />
      )}
      <Group grow>
        <ColorInput
          label="Background"
          placeholder="Default"
          swatches={GROUP_COLOR_SWATCHES}
          value={draft.data.backgroundColor ?? ''}
          onChange={(value) => setField('backgroundColor', value || undefined)}
        />
        <ColorInput
          label="Border"
          placeholder="Default"
          swatches={GROUP_COLOR_SWATCHES}
          value={draft.data.borderColor ?? ''}
          onChange={(value) => setField('borderColor', value || undefined)}
        />
      </Group>
      <Checkbox
        label="Show connection handles"
        description="Allows drawing edges directly to/from this group's border, when something on the sheet is selected"
        checked={draft.data.showHandles ?? false}
        onChange={(e) => setField('showHandles', e.currentTarget.checked)}
      />
      <Divider label="Description" labelPosition="left" />
      <MarkdownEditor
        value={draft.description}
        onCommit={(value) => setDraft((d) => ({ ...d, description: value }))}
      />
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete group
      </Button>
    </Stack>
  )
}
