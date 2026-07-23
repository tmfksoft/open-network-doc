import { useState } from 'react'
import {
  Stack,
  TextInput,
  Select,
  Textarea,
  Title,
  Divider,
  Button,
  Group,
  ActionIcon,
  Text,
  Badge,
  Checkbox,
} from '@mantine/core'
import { IconPencil, IconCheck } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { DeviceDocNode, DeviceData, DeviceType } from '../fileformat/types'
import { DeviceTypeIcon } from '../canvas/nodes/deviceIcons'
import { DEVICE_TYPE_LABELS } from '../canvas/nodes/deviceIconMap'

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

export default function DeviceInspector({ node }: DeviceInspectorProps) {
  const [editing, setEditing] = useState(false)

  return (
    <Stack p="md" gap="sm">
      <Group justify="space-between">
        <Title order={5}>Device</Title>
        <ActionIcon
          variant="subtle"
          aria-label={editing ? 'Done editing' : 'Edit device'}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? <IconCheck size={16} /> : <IconPencil size={16} />}
        </ActionIcon>
      </Group>
      {editing ? <DeviceEditForm node={node} /> : <DeviceReadOnlyView node={node} />}
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
        <DeviceTypeIcon deviceType={node.data.deviceType} size={20} />
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
      <FieldRow label="Vendor" value={node.data.vendor} />
      <FieldRow label="Model" value={node.data.model} />
      <Divider label="Description" labelPosition="left" />
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {node.description || (
          <Text component="span" c="dimmed">
            No description.
          </Text>
        )}
      </Text>
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete device
      </Button>
    </Stack>
  )
}

function DeviceEditForm({ node }: DeviceInspectorProps) {
  const updateNode = useDocumentStore((s) => s.updateNode)
  const removeNode = useDocumentStore((s) => s.removeNode)

  const setField = (field: keyof DeviceData, value: DeviceData[keyof DeviceData]) => {
    updateNode(node.sheetId, node.id, { data: { ...node.data, [field]: value } })
  }

  return (
    <Stack gap="sm" key={node.id}>
      <TextInput
        label="Label"
        defaultValue={node.label}
        onBlur={(e) => updateNode(node.sheetId, node.id, { label: e.currentTarget.value })}
      />
      <TextInput
        label="Hostname"
        defaultValue={node.data.hostname ?? ''}
        onBlur={(e) => setField('hostname', e.currentTarget.value)}
      />
      <TextInput
        label={
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <span>Static IP</span>
            <Checkbox
              label="DHCP"
              size="xs"
              checked={node.data.dhcp ?? false}
              onChange={(e) => setField('dhcp', e.currentTarget.checked)}
            />
          </Group>
        }
        placeholder={node.data.dhcp ? 'Assigned via DHCP' : '10.0.0.10'}
        disabled={node.data.dhcp}
        defaultValue={node.data.staticIp ?? ''}
        onBlur={(e) => setField('staticIp', e.currentTarget.value)}
      />
      <TextInput
        label="MAC Address"
        placeholder="00:11:22:33:44:55"
        defaultValue={node.data.macAddress ?? ''}
        onBlur={(e) => setField('macAddress', e.currentTarget.value)}
      />
      <Select
        label="Device type"
        data={DEVICE_TYPES.map((value) => ({ value, label: DEVICE_TYPE_LABELS[value] }))}
        value={node.data.deviceType ?? null}
        onChange={(value) => setField('deviceType', (value ?? undefined) as DeviceType | undefined)}
        clearable
      />
      <TextInput
        label="Vendor"
        defaultValue={node.data.vendor ?? ''}
        onBlur={(e) => setField('vendor', e.currentTarget.value)}
      />
      <TextInput
        label="Model"
        defaultValue={node.data.model ?? ''}
        onBlur={(e) => setField('model', e.currentTarget.value)}
      />
      <Divider label="Description" labelPosition="left" />
      <Textarea
        placeholder="Markdown description..."
        minRows={6}
        autosize
        defaultValue={node.description ?? ''}
        onBlur={(e) => updateNode(node.sheetId, node.id, { description: e.currentTarget.value })}
      />
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeNode(node.sheetId, node.id)}>
        Delete device
      </Button>
    </Stack>
  )
}
