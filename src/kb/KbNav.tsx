import { useMemo, useState } from 'react'
import { Stack, Group, Text, ActionIcon, NavLink, TextInput, Menu } from '@mantine/core'
import {
  IconPlus,
  IconFolderPlus,
  IconFolder,
  IconFolderOpen,
  IconFileText,
  IconDots,
  IconPencil,
  IconTrash,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import { MAX_KB_FOLDER_DEPTH } from '../store/slices/kbSlice'
import { buildKbTree, type KbTreeFolder } from './kbTree'
import type { KbFolder, KbPage } from '../fileformat/types'

type DragItem = { kind: 'page' | 'folder'; id: string }

export default function KbNav() {
  const kbPages = useDocumentStore((s) => s.kbPages)
  const kbFolders = useDocumentStore((s) => s.kbFolders)
  const activeKbPageId = useDocumentStore((s) => s.activeKbPageId)
  const setActiveKbPage = useDocumentStore((s) => s.setActiveKbPage)
  const addKbPage = useDocumentStore((s) => s.addKbPage)
  const addKbFolder = useDocumentStore((s) => s.addKbFolder)
  const renameKbFolder = useDocumentStore((s) => s.renameKbFolder)
  const removeKbFolder = useDocumentStore((s) => s.removeKbFolder)
  const moveKbPage = useDocumentStore((s) => s.moveKbPage)
  const moveKbFolder = useDocumentStore((s) => s.moveKbFolder)

  const [search, setSearch] = useState('')
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [dragItem, setDragItem] = useState<DragItem | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  const tree = useMemo(() => buildKbTree(kbFolders, kbPages), [kbFolders, kbPages])
  const folderNameById = useMemo(() => new Map(kbFolders.map((f) => [f.id, f.name])), [kbFolders])

  const toggleFolder = (folderId: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
  }

  const startDrag = (item: DragItem) => (e: React.DragEvent) => {
    // A nested row's dragstart otherwise bubbles up through every ancestor
    // folder (each also draggable with its own onDragStart), so the last
    // one to fire — the outermost ancestor — would silently overwrite
    // dragItem instead of the row actually grabbed.
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', item.id)
    setDragItem(item)
  }
  const endDrag = () => {
    setDragItem(null)
    setDropTargetId(null)
  }
  const dragOverRow = (rowId: string) => (e: React.DragEvent) => {
    if (!dragItem) return
    e.preventDefault()
    e.stopPropagation()
    setDropTargetId(rowId)
  }

  const dropOnFolder = (folder: KbFolder) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!dragItem) return
    if (dragItem.kind === 'folder') moveKbFolder(dragItem.id, folder.id)
    else moveKbPage(dragItem.id, folder.id)
    endDrag()
  }
  const dropOnPage = (page: KbPage) => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!dragItem) return
    if (dragItem.kind === 'page') moveKbPage(dragItem.id, page.folderId ?? null, page.id)
    else moveKbFolder(dragItem.id, page.folderId ?? null)
    endDrag()
  }
  const dropOnRoot = (e: React.DragEvent) => {
    e.preventDefault()
    if (!dragItem) return
    if (dragItem.kind === 'folder') moveKbFolder(dragItem.id, null)
    else moveKbPage(dragItem.id, null)
    endDrag()
  }

  const isSearching = search.trim().length > 0
  const searchResults = useMemo(() => {
    if (!isSearching) return []
    const q = search.trim().toLowerCase()
    return kbPages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [isSearching, search, kbPages])

  const folderBreadcrumb = (folderId: string | undefined): string | null => {
    const parts: string[] = []
    let current = folderId
    while (current) {
      const folder = kbFolders.find((f) => f.id === current)
      if (!folder) break
      parts.unshift(folder.name)
      current = folder.parentFolderId
    }
    return parts.length > 0 ? parts.join(' / ') : null
  }

  return (
    <Stack
      p="sm"
      gap="xs"
      h="100%"
      data-kb-drag-root
      style={{ minHeight: '100%' }}
      onDragOver={(e) => dragItem && e.preventDefault()}
      onDrop={dropOnRoot}
    >
      <Group justify="space-between">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Knowledgebase
        </Text>
        <Group gap={4}>
          <ActionIcon
            variant="subtle"
            aria-label="New folder"
            onClick={() => {
              const id = addKbFolder('New Folder')
              setRenamingFolderId(id)
            }}
          >
            <IconFolderPlus size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" aria-label="New page" onClick={() => setActiveKbPage(addKbPage('New Page'))}>
            <IconPlus size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <TextInput
        size="xs"
        placeholder="Search pages..."
        leftSection={<IconSearch size={14} />}
        rightSection={
          search ? (
            <ActionIcon variant="subtle" size="sm" aria-label="Clear search" onClick={() => setSearch('')}>
              <IconX size={12} />
            </ActionIcon>
          ) : null
        }
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      {isSearching ? (
        <Stack gap={2}>
          {searchResults.length === 0 ? (
            <Text size="sm" c="dimmed">
              No matching pages.
            </Text>
          ) : (
            searchResults.map((page) => {
              const breadcrumb = folderBreadcrumb(page.folderId)
              return (
                <NavLink
                  key={page.id}
                  label={page.title}
                  description={breadcrumb ?? undefined}
                  leftSection={<IconFileText size={14} />}
                  active={page.id === activeKbPageId}
                  onClick={() => setActiveKbPage(page.id)}
                />
              )
            })
          )}
        </Stack>
      ) : kbPages.length === 0 && kbFolders.length === 0 ? (
        <Text size="sm" c="dimmed">
          No pages yet.
        </Text>
      ) : (
        <FolderContents
          node={tree}
          depth={1}
          activeKbPageId={activeKbPageId}
          collapsedIds={collapsedIds}
          renamingFolderId={renamingFolderId}
          dropTargetId={dropTargetId}
          folderNameById={folderNameById}
          onSelectPage={setActiveKbPage}
          onToggleFolder={toggleFolder}
          onStartRename={setRenamingFolderId}
          onCommitRename={(id, name) => {
            renameKbFolder(id, name.trim() || folderNameById.get(id) || 'Untitled')
            setRenamingFolderId(null)
          }}
          onAddSubfolder={(parentId) => {
            const id = addKbFolder('New Folder', parentId)
            setCollapsedIds((prev) => {
              if (!prev.has(parentId)) return prev
              const next = new Set(prev)
              next.delete(parentId)
              return next
            })
            setRenamingFolderId(id)
          }}
          onAddPage={(folderId) => setActiveKbPage(addKbPage('New Page', folderId))}
          onDeleteFolder={removeKbFolder}
          onDragStart={startDrag}
          onDragEnd={endDrag}
          onDragOverRow={dragOverRow}
          onDropOnFolder={dropOnFolder}
          onDropOnPage={dropOnPage}
        />
      )}
    </Stack>
  )
}

interface FolderContentsProps {
  node: KbTreeFolder
  depth: number
  activeKbPageId: string | null
  collapsedIds: Set<string>
  renamingFolderId: string | null
  dropTargetId: string | null
  folderNameById: Map<string, string>
  onSelectPage: (id: string) => void
  onToggleFolder: (folderId: string) => void
  onStartRename: (folderId: string | null) => void
  onCommitRename: (folderId: string, name: string) => void
  onAddSubfolder: (parentId: string) => void
  onAddPage: (folderId: string) => void
  onDeleteFolder: (folderId: string) => void
  onDragStart: (item: DragItem) => (e: React.DragEvent) => void
  onDragEnd: () => void
  onDragOverRow: (rowId: string) => (e: React.DragEvent) => void
  onDropOnFolder: (folder: KbFolder) => (e: React.DragEvent) => void
  onDropOnPage: (page: KbPage) => (e: React.DragEvent) => void
}

function FolderContents(props: FolderContentsProps) {
  const { node, onDropOnFolder, onDropOnPage } = props

  return (
    <>
      {node.folders.map((sub) => {
        const folder = sub.folder!
        const expanded = !props.collapsedIds.has(folder.id)
        const isDropTarget = props.dropTargetId === folder.id
        const isRenaming = props.renamingFolderId === folder.id

        return (
          <div
            key={folder.id}
            data-kb-drag-id={folder.id}
            draggable={!isRenaming}
            onDragStart={props.onDragStart({ kind: 'folder', id: folder.id })}
            onDragEnd={props.onDragEnd}
            onDragOver={props.onDragOverRow(folder.id)}
            onDrop={onDropOnFolder(folder)}
            style={{
              borderRadius: 4,
              outline: isDropTarget ? '2px solid var(--mantine-color-blue-5)' : undefined,
              outlineOffset: -2,
            }}
          >
            <NavLink
              label={
                isRenaming ? (
                  <TextInput
                    size="xs"
                    autoFocus
                    defaultValue={folder.name}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => props.onCommitRename(folder.id, e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                      if (e.key === 'Escape') props.onStartRename(null)
                    }}
                  />
                ) : (
                  folder.name
                )
              }
              leftSection={expanded ? <IconFolderOpen size={14} /> : <IconFolder size={14} />}
              opened={expanded}
              onClick={() => props.onToggleFolder(folder.id)}
              rightSection={
                isRenaming ? null : (
                  <Menu shadow="md" position="bottom-end" withinPortal returnFocus={false}>
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        aria-label={`${folder.name} options`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconDots size={14} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                      <Menu.Item leftSection={<IconPlus size={14} />} onClick={() => props.onAddPage(folder.id)}>
                        New page here
                      </Menu.Item>
                      {props.depth < MAX_KB_FOLDER_DEPTH && (
                        <Menu.Item
                          leftSection={<IconFolderPlus size={14} />}
                          onClick={() => props.onAddSubfolder(folder.id)}
                        >
                          New subfolder
                        </Menu.Item>
                      )}
                      <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => props.onStartRename(folder.id)}>
                        Rename
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => props.onDeleteFolder(folder.id)}
                      >
                        Delete folder
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )
              }
              childrenOffset={16}
            >
              {expanded && <FolderContents {...props} node={sub} depth={props.depth + 1} />}
            </NavLink>
          </div>
        )
      })}
      {node.pages.map((page) => (
        <div
          key={page.id}
          data-kb-drag-id={page.id}
          draggable
          onDragStart={props.onDragStart({ kind: 'page', id: page.id })}
          onDragEnd={props.onDragEnd}
          onDragOver={props.onDragOverRow(page.id)}
          onDrop={onDropOnPage(page)}
          style={{
            borderRadius: 4,
            outline: props.dropTargetId === page.id ? '2px solid var(--mantine-color-blue-5)' : undefined,
            outlineOffset: -2,
          }}
        >
          <NavLink
            label={page.title}
            leftSection={<IconFileText size={14} />}
            active={page.id === props.activeKbPageId}
            onClick={() => props.onSelectPage(page.id)}
          />
        </div>
      ))}
    </>
  )
}
