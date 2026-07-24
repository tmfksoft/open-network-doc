import { useRef, useState } from 'react'
import {
  Stack,
  TextInput,
  NumberInput,
  Select,
  Divider,
  Button,
  Group,
  ActionIcon,
  Text,
  Badge,
  Checkbox,
} from '@mantine/core'
import { IconUpload, IconX } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { DeviceDocNode, DeviceData, DeviceType } from '../fileformat/types'
import DeviceIcon from '../canvas/nodes/DeviceIcon'
import { DEVICE_TYPE_LABELS } from '../canvas/nodes/deviceIconMap'
import { registerAsset } from '../assets-runtime/assetStore'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'

const DEVICE_TYPES: DeviceType[] = [
  'server',
  'workstation',
  'router',
  'switch',
  'firewall',
  'ap',
  'printer',
  'other',
]

interface DeviceInspectorProps {
  node: DeviceDocNode
}

interface Draft {
  label: string
  description: string
  data: DeviceData
}

function toDraft(node: DeviceDocNode): Draft {
  return { label: node.label, description: node.description ?? '', data: { ...node.data } }
}

export default function DeviceInspector({ node }: DeviceInspectorProps) {
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
        title="Device"
        editing={editing}
        editLabel="Edit device"
        onEdit={startEdit}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
      {editing ? (
        <DeviceEditForm node={node} draft={draft} setDraft={setDraft} />
      ) : (
        <DeviceReadOnlyView node={node} />
      )}
    </Stack>
  )
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

function DeviceReadOnlyView({ node }: DeviceInspectorProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <DeviceIcon deviceType={node.data.deviceType} logoAssetId={node.data.iconAssetId} size={20} />
        <Text fw={600}>{node.label}</Text>
        {node.data.deviceType && (
          <Badge size="xs" variant="light">
            {DEVICE_TYPE_LABELS[node.data.deviceType]}
          </Badge>
        )}
      </Group>
      <FieldRow label="Hostname" value={node.data.hostname} />
      <FieldRow label="Static IP" value={node.data.dhcp ? 'DHCP' : node.data.staticIp} />
      <FieldRow label="MAC Address" value={node.data.macAddress} />
      <FieldRow label="VLAN ID" value={String(node.data.vlanId ?? 0)} />
      <FieldRow label="Vendor" value={node.data.vendor} />
      <FieldRow label="Model" value={node.data.model} />
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
        Delete device
      </Button>
    </Stack>
  )
}

interface DeviceEditFormProps {
  node: DeviceDocNode
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
}

function DeviceEditForm({ node, draft, setDraft }: DeviceEditFormProps) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setField = (field: keyof DeviceData, value: DeviceData[keyof DeviceData]) => {
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
          <DeviceIcon deviceType={draft.data.deviceType} logoAssetId={draft.data.iconAssetId} size={36} />
          <Button
            size="xs"
            variant="default"
            leftSection={<IconUpload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload logo
          </Button>
          {draft.data.iconAssetId && (
            <ActionIcon
              variant="subtle"
              color="red"
              aria-label="Remove logo"
              onClick={() => setField('iconAssetId', undefined)}
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
            if (file) setField('iconAssetId', registerAsset(file))
          }}
        />
      </div>

      <TextInput
        label="Hostname"
        value={draft.data.hostname ?? ''}
        onChange={(e) => setField('hostname', e.currentTarget.value)}
      />
      <TextInput
        label={
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <span>Static IP</span>
            <Checkbox
              label="DHCP"
              size="xs"
              checked={draft.data.dhcp ?? false}
              onChange={(e) => setField('dhcp', e.currentTarget.checked)}
            />
          </Group>
        }
        placeholder={draft.data.dhcp ? 'Assigned via DHCP' : '10.0.0.10'}
        disabled={draft.data.dhcp}
        value={draft.data.staticIp ?? ''}
        onChange={(e) => setField('staticIp', e.currentTarget.value)}
      />
      <TextInput
        label="MAC Address"
        placeholder="00:11:22:33:44:55"
        value={draft.data.macAddress ?? ''}
        onChange={(e) => setField('macAddress', e.currentTarget.value)}
      />
      <NumberInput
        label="VLAN ID"
        min={0}
        max={4094}
        value={draft.data.vlanId ?? 0}
        onChange={(value) => setField('vlanId', Number(value) || 0)}
      />
      <Select
        label="Device type"
        description={draft.data.iconAssetId ? 'Icon used when the logo above is removed' : undefined}
        data={DEVICE_TYPES.map((value) => ({ value, label: DEVICE_TYPE_LABELS[value] }))}
        value={draft.data.deviceType ?? null}
        onChange={(value) => setField('deviceType', (value ?? undefined) as DeviceType | undefined)}
        clearable
      />
      <TextInput
        label="Vendor"
        value={draft.data.vendor ?? ''}
        onChange={(e) => setField('vendor', e.currentTarget.value)}
      />
      <TextInput
        label="Model"
        value={draft.data.model ?? ''}
        onChange={(e) => setField('model', e.currentTarget.value)}
      />
      <Divider label="Description" labelPosition="left" />
      <MarkdownEditor
        value={draft.description}
        onCommit={(value) => setDraft((d) => ({ ...d, description: value }))}
      />
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete device
      </Button>
    </Stack>
  )
}
