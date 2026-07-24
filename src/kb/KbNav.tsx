import { Stack, Group, Text, ActionIcon, NavLink } from '@mantine/core'
import { IconPlus, IconFolder, IconFileText } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import { buildKbTree, type KbTreeFolder } from './kbTree'

export default function KbNav() {
  const kbPages = useDocumentStore((s) => s.kbPages)
  const activeKbPageId = useDocumentStore((s) => s.activeKbPageId)
  const setActiveKbPage = useDocumentStore((s) => s.setActiveKbPage)
  const addKbPage = useDocumentStore((s) => s.addKbPage)

  const tree = buildKbTree(kbPages)

  return (
    <Stack p="sm" gap="xs">
      <Group justify="space-between">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Knowledgebase
        </Text>
        <ActionIcon
          variant="subtle"
          aria-label="New page"
          onClick={() => setActiveKbPage(addKbPage('New Page'))}
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
      {kbPages.length === 0 ? (
        <Text size="sm" c="dimmed">
          No pages yet.
        </Text>
      ) : (
        <FolderContents folder={tree} activeKbPageId={activeKbPageId} onSelectPage={setActiveKbPage} />
      )}
    </Stack>
  )
}

function FolderContents({
  folder,
  activeKbPageId,
  onSelectPage,
}: {
  folder: KbTreeFolder
  activeKbPageId: string | null
  onSelectPage: (id: string) => void
}) {
  return (
    <>
      {folder.folders.map((sub) => (
        <NavLink
          key={sub.path}
          label={sub.name}
          leftSection={<IconFolder size={14} />}
          defaultOpened
          childrenOffset={16}
        >
          <FolderContents folder={sub} activeKbPageId={activeKbPageId} onSelectPage={onSelectPage} />
        </NavLink>
      ))}
      {folder.pages.map((page) => (
        <NavLink
          key={page.id}
          label={page.title}
          leftSection={<IconFileText size={14} />}
          active={page.id === activeKbPageId}
          onClick={() => onSelectPage(page.id)}
        />
      ))}
    </>
  )
}
