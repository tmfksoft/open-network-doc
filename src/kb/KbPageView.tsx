import { useState } from 'react'
import { Stack, Group, TextInput, TagsInput, Text, Title, Badge, ActionIcon, Divider } from '@mantine/core'
import { IconPencil, IconCheck, IconX, IconTrash } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { KbPage } from '../fileformat/types'
import MarkdownEditor from '../markdown/MarkdownEditor'
import MarkdownRenderer from '../markdown/MarkdownRenderer'

interface Draft {
  title: string
  tags: string[]
  content: string
}

function toDraft(page: KbPage): Draft {
  return { title: page.title, tags: page.tags, content: page.content ?? '' }
}

export default function KbPageView() {
  const activeKbPageId = useDocumentStore((s) => s.activeKbPageId)
  const kbPages = useDocumentStore((s) => s.kbPages)
  const updateKbPage = useDocumentStore((s) => s.updateKbPage)
  const removeKbPage = useDocumentStore((s) => s.removeKbPage)

  const page = kbPages.find((p) => p.id === activeKbPageId)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => (page ? toDraft(page) : { title: '', tags: [], content: '' }))

  if (!page) {
    return (
      <Stack align="center" justify="center" h="100%" p="xl">
        <Text c="dimmed">Select a page from the list, or create a new one.</Text>
      </Stack>
    )
  }

  const startEdit = () => {
    setDraft(toDraft(page))
    setEditing(true)
  }
  const save = () => {
    updateKbPage(page.id, { title: draft.title || page.title, tags: draft.tags, content: draft.content })
    setEditing(false)
  }

  if (editing) {
    return (
      <Stack p="xl" gap="sm" maw={860} key={page.id}>
        <Group justify="space-between" align="flex-end">
          <TextInput
            variant="unstyled"
            styles={{ input: { fontSize: 28, fontWeight: 700 } }}
            value={draft.title}
            onChange={(e) => {
              const value = e.currentTarget.value
              setDraft((d) => ({ ...d, title: value }))
            }}
            style={{ flex: 1 }}
          />
          <Group gap={4}>
            <ActionIcon variant="subtle" color="red" aria-label="Cancel changes" onClick={() => setEditing(false)}>
              <IconX size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="green" aria-label="Save changes" onClick={save}>
              <IconCheck size={18} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" aria-label="Delete page" onClick={() => removeKbPage(page.id)}>
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        </Group>
        <Divider />
        <MarkdownEditor
          value={draft.content}
          onCommit={(value) => setDraft((d) => ({ ...d, content: value }))}
          minRows={16}
        />
        <TagsInput label="Tags" value={draft.tags} onChange={(tags) => setDraft((d) => ({ ...d, tags }))} />
      </Stack>
    )
  }

  return (
    <Stack p="xl" gap="sm" maw={860} key={page.id}>
      <Group justify="space-between" align="flex-start">
        <Title order={2} style={{ flex: 1 }}>
          {page.title}
        </Title>
        <Group gap={4}>
          <ActionIcon variant="subtle" aria-label="Edit page" onClick={startEdit}>
            <IconPencil size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" aria-label="Delete page" onClick={() => removeKbPage(page.id)}>
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Group>
      <Divider />
      {page.content ? (
        <MarkdownRenderer content={page.content} />
      ) : (
        <Text c="dimmed">Empty page.</Text>
      )}
      {page.tags.length > 0 && (
        <Group gap={4}>
          {page.tags.map((tag) => (
            <Badge key={tag} size="sm" variant="light">
              {tag}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  )
}
