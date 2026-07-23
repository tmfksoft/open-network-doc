import { useState } from 'react'
import { Stack, Group, Text, ActionIcon, TextInput, UnstyledButton } from '@mantine/core'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'

export default function SheetList() {
  const sheets = useDocumentStore((s) => s.sheets)
  const activeSheetId = useDocumentStore((s) => s.activeSheetId)
  const setActiveSheet = useDocumentStore((s) => s.setActiveSheet)
  const addSheet = useDocumentStore((s) => s.addSheet)
  const renameSheet = useDocumentStore((s) => s.renameSheet)
  const removeSheet = useDocumentStore((s) => s.removeSheet)
  const [renamingId, setRenamingId] = useState<string | null>(null)

  return (
    <Stack p="sm" gap="xs">
      <Group justify="space-between">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Sheets
        </Text>
        <ActionIcon variant="subtle" aria-label="Add sheet" onClick={() => addSheet()}>
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
      <Stack gap={2}>
        {sheets.map((sheet) => (
          <Group key={sheet.id} gap={4} wrap="nowrap" justify="space-between">
            {renamingId === sheet.id ? (
              <TextInput
                size="xs"
                autoFocus
                defaultValue={sheet.name}
                style={{ flex: 1 }}
                onBlur={(e) => {
                  renameSheet(sheet.id, e.currentTarget.value || sheet.name)
                  setRenamingId(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                  if (e.key === 'Escape') setRenamingId(null)
                }}
              />
            ) : (
              <UnstyledButton
                onClick={() => setActiveSheet(sheet.id)}
                onDoubleClick={() => setRenamingId(sheet.id)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: 4,
                  backgroundColor:
                    sheet.id === activeSheetId ? 'var(--mantine-color-blue-light)' : undefined,
                }}
              >
                <Text size="sm" truncate fw={sheet.id === activeSheetId ? 600 : 400}>
                  {sheet.name}
                </Text>
              </UnstyledButton>
            )}
            {sheets.length > 1 && (
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                aria-label={`Delete ${sheet.name}`}
                onClick={() => removeSheet(sheet.id)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            )}
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}
