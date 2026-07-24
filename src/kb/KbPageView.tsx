import { Stack, Group, TextInput, TagsInput, Button, Text, Divider } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import MarkdownEditor from '../markdown/MarkdownEditor'

export default function KbPageView() {
  const activeKbPageId = useDocumentStore((s) => s.activeKbPageId)
  const kbPages = useDocumentStore((s) => s.kbPages)
  const updateKbPage = useDocumentStore((s) => s.updateKbPage)
  const removeKbPage = useDocumentStore((s) => s.removeKbPage)

  const page = kbPages.find((p) => p.id === activeKbPageId)

  if (!page) {
    return (
      <Stack align="center" justify="center" h="100%" p="xl">
        <Text c="dimmed">Select a page from the list, or create a new one.</Text>
      </Stack>
    )
  }

  return (
    <Stack p="xl" gap="sm" maw={860} key={page.id}>
      <Group justify="space-between" align="flex-end">
        <TextInput
          variant="unstyled"
          styles={{ input: { fontSize: 28, fontWeight: 700 } }}
          defaultValue={page.title}
          onBlur={(e) => updateKbPage(page.id, { title: e.currentTarget.value || page.title })}
          style={{ flex: 1 }}
        />
        <Button color="red" variant="outline" onClick={() => removeKbPage(page.id)}>
          Delete page
        </Button>
      </Group>
      <Group grow>
        <TextInput
          label="Folder"
          placeholder="e.g. network/wifi"
          defaultValue={page.folderPath ?? ''}
          onBlur={(e) => updateKbPage(page.id, { folderPath: e.currentTarget.value || undefined })}
        />
        <TagsInput
          label="Tags"
          value={page.tags}
          onChange={(tags) => updateKbPage(page.id, { tags })}
        />
      </Group>
      <Divider />
      <MarkdownEditor
        value={page.content ?? ''}
        onCommit={(value) => updateKbPage(page.id, { content: value })}
        minRows={16}
      />
    </Stack>
  )
}
