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
  Paper,
  SimpleGrid,
  Modal,
} from '@mantine/core'
import { IconUpload, IconX, IconPlus, IconTrash, IconWorld, IconPencil, IconLibraryPhoto } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { DeviceDocNode, DeviceData, DeviceType, DeviceService, ServiceProtocol } from '../fileformat/types'
import DeviceIcon from '../canvas/nodes/DeviceIcon'
import { DEVICE_TYPE_LABELS } from '../canvas/nodes/deviceIconMap'
import { registerAsset } from '../assets-runtime/assetStore'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'
import EmbeddedImagePicker from '../components/EmbeddedImagePicker'
import { ColorFieldsReadView, ColorFieldsEditForm } from '../components/NodeColorFields'
import { formatServicePortRange } from '../utils/services'

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

const SERVICE_PROTOCOLS: { value: ServiceProtocol; label: string }[] = [
  { value: 'tcp', label: 'TCP' },
  { value: 'udp', label: 'UDP' },
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
      <SimpleGrid cols={2} spacing="sm">
        <FieldRow label="Hostname" value={node.data.hostname} />
        <FieldRow label="MAC Address" value={node.data.macAddress} />
        <FieldRow label="Static IP" value={node.data.dhcp ? 'DHCP' : node.data.staticIp} />
        <FieldRow label="VLAN ID" value={String(node.data.vlanId ?? 0)} />
        <FieldRow label="Vendor" value={node.data.vendor} />
        <FieldRow label="Model" value={node.data.model} />
      </SimpleGrid>
      <ColorFieldsReadView backgroundColor={node.data.backgroundColor} borderColor={node.data.borderColor} />
      <Divider label="Services" labelPosition="left" />
      {node.data.services && node.data.services.length > 0 ? (
        <Stack gap={6}>
          {node.data.services.map((service) => (
            <Paper key={service.id} withBorder p={6} radius="sm">
              <Group justify="space-between" wrap="nowrap">
                <Group gap={6} wrap="nowrap">
                  <Text size="sm" fw={500}>
                    {service.name || 'Unnamed service'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatServicePortRange(service)}/{service.protocol}
                  </Text>
                </Group>
                {service.public && (
                  <Badge size="xs" color="orange" variant="light" leftSection={<IconWorld size={10} />}>
                    Public
                  </Badge>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed">
          No services.
        </Text>
      )}
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
  const [pickerOpen, setPickerOpen] = useState(false)

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
          <Button
            size="xs"
            variant="default"
            leftSection={<IconLibraryPhoto size={14} />}
            onClick={() => setPickerOpen(true)}
          >
            Choose existing
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
        <EmbeddedImagePicker
          opened={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(assetId) => setField('iconAssetId', assetId)}
        />
      </div>

      <SimpleGrid cols={2} spacing="sm">
        <TextInput
          label="Hostname"
          value={draft.data.hostname ?? ''}
          onChange={(e) => setField('hostname', e.currentTarget.value)}
        />
        <TextInput
          label="MAC Address"
          placeholder="00:11:22:33:44:55"
          value={draft.data.macAddress ?? ''}
          onChange={(e) => setField('macAddress', e.currentTarget.value)}
        />
      </SimpleGrid>
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
      <SimpleGrid cols={2} spacing="sm">
        <NumberInput
          label="VLAN ID"
          min={0}
          max={4094}
          value={draft.data.vlanId ?? 0}
          onChange={(value) => setField('vlanId', Number(value) || 0)}
        />
        <Select
          label="Device type"
          data={DEVICE_TYPES.map((value) => ({ value, label: DEVICE_TYPE_LABELS[value] }))}
          value={draft.data.deviceType ?? null}
          onChange={(value) => setField('deviceType', (value ?? undefined) as DeviceType | undefined)}
          clearable
        />
      </SimpleGrid>
      <SimpleGrid cols={2} spacing="sm">
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
      </SimpleGrid>
      <ColorFieldsEditForm
        backgroundColor={draft.data.backgroundColor}
        borderColor={draft.data.borderColor}
        onBackgroundChange={(value) => setField('backgroundColor', value)}
        onBorderChange={(value) => setField('borderColor', value)}
      />
      <Divider label="Services" labelPosition="left" />
      <ServicesEditor
        services={draft.data.services ?? []}
        onChange={(services) => setField('services', services)}
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

interface ServicesEditorProps {
  services: DeviceService[]
  onChange: (services: DeviceService[]) => void
}

function emptyService(): DeviceService {
  return { id: crypto.randomUUID(), name: '', portStart: 80, protocol: 'tcp', public: false }
}

function ServicesEditor({ services, onChange }: ServicesEditorProps) {
  const [modalService, setModalService] = useState<DeviceService | null>(null)
  const [isNew, setIsNew] = useState(false)

  const openAdd = () => {
    setModalService(emptyService())
    setIsNew(true)
  }
  const openEdit = (service: DeviceService) => {
    setModalService({ ...service })
    setIsNew(false)
  }
  const closeModal = () => setModalService(null)
  const updateModalService = (patch: Partial<DeviceService>) => {
    setModalService((s) => (s ? { ...s, ...patch } : s))
  }
  const saveModal = () => {
    if (!modalService) return
    onChange(
      isNew ? [...services, modalService] : services.map((s) => (s.id === modalService.id ? modalService : s)),
    )
    closeModal()
  }
  const removeService = (id: string) => {
    onChange(services.filter((s) => s.id !== id))
  }

  return (
    <Stack gap="xs">
      {services.length === 0 ? (
        <Text size="sm" c="dimmed">
          No services.
        </Text>
      ) : (
        services.map((service) => (
          <Paper key={service.id} withBorder p={6} radius="sm">
            <Group justify="space-between" wrap="nowrap" gap={6}>
              <Group gap={6} wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                <Text size="sm" fw={500} truncate>
                  {service.name || 'Unnamed service'}
                </Text>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {formatServicePortRange(service)}/{service.protocol}
                </Text>
                {service.public && (
                  <Badge size="xs" color="orange" variant="light" leftSection={<IconWorld size={10} />}>
                    Public
                  </Badge>
                )}
              </Group>
              <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  aria-label="Edit service"
                  onClick={() => openEdit(service)}
                >
                  <IconPencil size={14} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  aria-label="Remove service"
                  onClick={() => removeService(service.id)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        ))
      )}
      <Button size="xs" variant="default" leftSection={<IconPlus size={14} />} onClick={openAdd}>
        Add service
      </Button>

      <Modal opened={modalService !== null} onClose={closeModal} title={isNew ? 'Add service' : 'Edit service'} size="sm">
        {modalService && (
          <Stack gap="sm">
            <TextInput
              label="Service name"
              data-autofocus
              value={modalService.name}
              onChange={(e) => updateModalService({ name: e.currentTarget.value })}
            />
            <Group grow align="flex-start">
              <NumberInput
                label="Port"
                min={1}
                max={65535}
                value={modalService.portStart}
                onChange={(value) => updateModalService({ portStart: Number(value) || 1 })}
              />
              <NumberInput
                label="End port"
                min={1}
                max={65535}
                value={modalService.portEnd ?? ''}
                onChange={(value) => updateModalService({ portEnd: value === '' ? undefined : Number(value) })}
              />
            </Group>
            <Text size="xs" c="dimmed" mt={-8}>
              End port is optional — leave blank, or same as start, for a single port
            </Text>
            <Select
              label="Protocol"
              data={SERVICE_PROTOCOLS}
              value={modalService.protocol}
              onChange={(value) => updateModalService({ protocol: (value as ServiceProtocol) ?? 'tcp' })}
              allowDeselect={false}
            />
            <Checkbox
              label="Public (accessible from outside world)"
              checked={modalService.public}
              onChange={(e) => updateModalService({ public: e.currentTarget.checked })}
            />
            <Group justify="flex-end" mt="xs">
              <Button variant="default" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={saveModal}>Save</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}
