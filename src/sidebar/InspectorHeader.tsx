import { ActionIcon, Group, Title } from '@mantine/core'
import { IconPencil, IconCheck, IconX } from '@tabler/icons-react'

interface InspectorHeaderProps {
  title: string
  editing: boolean
  editLabel: string
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

/**
 * Shared inspector title row: a single pencil button to enter edit mode, or a
 * cancel (X) + save (tick) pair while editing. Edits are staged locally by
 * the caller and only committed to the document when Save is clicked.
 */
export default function InspectorHeader({ title, editing, editLabel, onEdit, onSave, onCancel }: InspectorHeaderProps) {
  return (
    <Group justify="space-between">
      <Title order={5}>{title}</Title>
      {editing ? (
        <Group gap={4}>
          <ActionIcon variant="subtle" color="red" aria-label="Cancel changes" onClick={onCancel}>
            <IconX size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="green" aria-label="Save changes" onClick={onSave}>
            <IconCheck size={16} />
          </ActionIcon>
        </Group>
      ) : (
        <ActionIcon variant="subtle" aria-label={editLabel} onClick={onEdit}>
          <IconPencil size={16} />
        </ActionIcon>
      )}
    </Group>
  )
}
