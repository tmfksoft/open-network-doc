import { useState } from 'react'
import {
  Stack,
  TextInput,
  NumberInput,
  Select,
  ColorInput,
  ColorSwatch,
  Divider,
  Button,
  Group,
  Text,
  Badge,
  SimpleGrid,
} from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import type { DocEdge, EdgeArrowStyle, EdgeLineStyle, EdgeType } from '../fileformat/types'
import { EDGE_TYPE_ICONS, EDGE_TYPE_LABELS } from '../canvas/edges/edgeTypeMeta'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'
import InspectorHeader from './InspectorHeader'

const EDGE_TYPES: EdgeType[] = ['physical_link', 'logical_link', 'vlan_membership', 'vpn_tunnel', 'http', 'https']

const EDGE_COLOR_SWATCHES = [
  '#e03131',
  '#f08c00',
  '#2f9e44',
  '#1971c2',
  '#7048e8',
  '#e64980',
  '#495057',
]

const LINE_STYLES: { value: EdgeLineStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
]

const ARROW_STYLES: { value: EdgeArrowStyle; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'forward', label: 'Forward' },
  { value: 'both', label: 'Both directions' },
]
const ARROW_STYLE_LABELS: Record<EdgeArrowStyle, string> = {
  none: 'None',
  forward: 'Forward',
  both: 'Both directions',
}

interface EdgeInspectorProps {
  edge: DocEdge
}

interface Draft {
  type: EdgeType
  label: string
  color?: string
  vlanId: number
  lineStyle: EdgeLineStyle
  arrowStyle: EdgeArrowStyle
  description: string
}

function toDraft(edge: DocEdge): Draft {
  return {
    type: edge.type,
    label: edge.label ?? '',
    color: edge.color,
    vlanId: edge.vlanId ?? 0,
    lineStyle: edge.lineStyle ?? 'solid',
    arrowStyle: edge.arrowStyle ?? 'none',
    description: edge.description ?? '',
  }
}

export default function EdgeInspector({ edge }: EdgeInspectorProps) {
  const updateEdge = useDocumentStore((s) => s.updateEdge)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => toDraft(edge))

  const startEdit = () => {
    setDraft(toDraft(edge))
    setEditing(true)
  }
  const save = () => {
    updateEdge(edge.sheetId, edge.id, {
      type: draft.type,
      label: draft.label,
      color: draft.color,
      vlanId: draft.vlanId,
      lineStyle: draft.lineStyle,
      arrowStyle: draft.arrowStyle,
      description: draft.description,
    })
    setEditing(false)
  }

  return (
    <Stack p="md" gap="sm">
      <InspectorHeader
        title="Connection"
        editing={editing}
        editLabel="Edit connection"
        onEdit={startEdit}
        onSave={save}
        onCancel={() => setEditing(false)}
      />
      {editing ? (
        <EdgeEditForm edge={edge} draft={draft} setDraft={setDraft} />
      ) : (
        <EdgeReadOnlyView edge={edge} />
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

function EdgeReadOnlyView({ edge }: EdgeInspectorProps) {
  const removeEdge = useDocumentStore((s) => s.removeEdge)
  const Icon = EDGE_TYPE_ICONS[edge.type]

  return (
    <Stack gap="sm">
      <Group gap="xs">
        <Icon size={20} />
        <Text fw={600}>{edge.label || EDGE_TYPE_LABELS[edge.type]}</Text>
        <Badge size="xs" variant="light">
          {EDGE_TYPE_LABELS[edge.type]}
        </Badge>
      </Group>
      <FieldRow label="Label" value={edge.label} />
      <SimpleGrid cols={2} spacing="sm">
        <FieldRow label="VLAN ID" value={String(edge.vlanId ?? 0)} />
        <FieldRow label="Line style" value={edge.lineStyle === 'dashed' ? 'Dashed' : 'Solid'} />
        <div>
          <Text size="xs" c="dimmed">
            Color
          </Text>
          {edge.color ? (
            <Group gap={6} mt={2}>
              <ColorSwatch color={edge.color} size={16} />
              <Text size="sm">{edge.color}</Text>
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              Default
            </Text>
          )}
        </div>
        <FieldRow label="Arrows" value={ARROW_STYLE_LABELS[edge.arrowStyle ?? 'none']} />
      </SimpleGrid>
      <Divider label="Description" labelPosition="left" />
      {edge.description ? (
        <MarkdownRenderer content={edge.description} />
      ) : (
        <Text size="sm" c="dimmed">
          No description.
        </Text>
      )}
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeEdge(edge.sheetId, edge.id)}>
        Delete connection
      </Button>
    </Stack>
  )
}

interface EdgeEditFormProps {
  edge: DocEdge
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
}

function EdgeEditForm({ edge, draft, setDraft }: EdgeEditFormProps) {
  const removeEdge = useDocumentStore((s) => s.removeEdge)

  return (
    <Stack gap="sm" key={edge.id}>
      <Select
        label="Type"
        data={EDGE_TYPES.map((value) => ({ value, label: EDGE_TYPE_LABELS[value] }))}
        value={draft.type}
        onChange={(value) => value && setDraft((d) => ({ ...d, type: value as EdgeType }))}
        allowDeselect={false}
      />
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
          min={0}
          max={4094}
          value={draft.vlanId}
          onChange={(value) => setDraft((d) => ({ ...d, vlanId: Number(value) || 0 }))}
        />
        <Select
          label="Line style"
          data={LINE_STYLES}
          value={draft.lineStyle}
          onChange={(value) => value && setDraft((d) => ({ ...d, lineStyle: value as EdgeLineStyle }))}
          allowDeselect={false}
        />
      </SimpleGrid>
      <ColorInput
        label="Color"
        placeholder="Default"
        swatches={EDGE_COLOR_SWATCHES}
        value={draft.color ?? ''}
        onChange={(value) => setDraft((d) => ({ ...d, color: value || undefined }))}
      />
      <Select
        label="Arrows"
        data={ARROW_STYLES}
        value={draft.arrowStyle}
        onChange={(value) => value && setDraft((d) => ({ ...d, arrowStyle: value as EdgeArrowStyle }))}
        allowDeselect={false}
      />
      <Divider label="Description" labelPosition="left" />
      <MarkdownEditor
        value={draft.description}
        onCommit={(value) => setDraft((d) => ({ ...d, description: value }))}
      />
      <Divider />
      <Button color="red" variant="outline" onClick={() => removeEdge(edge.sheetId, edge.id)}>
        Delete connection
      </Button>
    </Stack>
  )
}
