import { useRef, useState } from 'react'
import {
  Stack,
  TextInput,
  Select,
  Checkbox,
  Title,
  Divider,
  Button,
  Group,
  ActionIcon,
  Text,
} from '@mantine/core'
import { IconPencil, IconCheck, IconUpload, IconX } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { GroupHeaderDocNode, GroupHeaderData } from '../fileformat/types'
import GroupHeaderIcon from '../canvas/nodes/GroupHeaderIcon'
import { GROUP_ICON_KEYS, GROUP_ICON_LABELS, type GroupIconKey } from '../canvas/nodes/groupIconMap'
import { registerAsset } from '../assets-runtime/assetStore'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'

interface GroupInspectorProps {
  node: GroupHeaderDocNode
}

export default function GroupInspector({ node }: GroupInspectorProps) {
  const [editing, setEditing] = useState(false)

  return (
    <Stack p="md" gap="sm">
      <Group justify="space-between">
        <Title order={5}>Group</Title>
        <ActionIcon
          variant="subtle"
          aria-label={editing ? 'Done editing' : 'Edit group'}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? <IconCheck size={16} /> : <IconPencil size={16} />}
        </ActionIcon>
      </Group>
      {editing ? <GroupEditForm node={node} /> : <GroupReadOnlyView node={node} />}
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
      <div>
        <Text size="xs" c="dimmed">
          Connection handles
        </Text>
        <Text size="sm">{node.data.hideHandles ? 'Hidden' : 'Shown'}</Text>
      </div>
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

function GroupEditForm({ node }: GroupInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const removeNode = useDocumentStore((s) => s.removeNode)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setField = (field: keyof GroupHeaderData, value: GroupHeaderData[keyof GroupHeaderData]) => {
    updateNode(node.sheetId, node.id, { data: { ...node.data, [field]: value } })
  }

  return (
    <Stack gap="sm" key={node.id}>
      <TextInput
        label="Label"
        defaultValue={node.label}
        onBlur={(e) => updateNode(node.sheetId, node.id, { label: e.currentTarget.value })}
      />

      <div>
        <Text size="sm" fw={500} mb={4}>
          Logo
        </Text>
        <Group gap="xs">
          <GroupHeaderIcon icon={node.data.icon} logoAssetId={node.data.logoAssetId} size={36} />
          <Button
            size="xs"
            variant="default"
            leftSection={<IconUpload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload logo
          </Button>
          {node.data.logoAssetId && (
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

      <Select
        label="Icon"
        description={node.data.logoAssetId ? 'Used when the logo above is removed' : undefined}
        data={GROUP_ICON_KEYS.map((value) => ({ value, label: GROUP_ICON_LABELS[value] }))}
        value={node.data.icon ?? null}
        onChange={(value) => setField('icon', (value ?? undefined) as GroupIconKey | undefined)}
        clearable
      />
      <Checkbox
        label="Hide connection handles"
        description="Prevents drawing edges directly to/from this group's border"
        checked={node.data.hideHandles ?? false}
        onChange={(e) => setField('hideHandles', e.currentTarget.checked)}
      />
      <Divider label="Description" labelPosition="left" />
      <MarkdownEditor
        value={node.description ?? ''}
        onCommit={(value) => updateNode(node.sheetId, node.id, { description: value })}
      />
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete group
      </Button>
    </Stack>
  )
}
