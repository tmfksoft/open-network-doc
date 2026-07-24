import { useRef } from 'react'
import { Menu, Button } from '@mantine/core'
import { IconChevronDown, IconFile, IconFolderOpen, IconDeviceFloppy } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useDocumentStore } from '../store/useDocumentStore'
import { createNewDocument } from '../store/documentIO'
import { saveDocument } from '../fileformat/io/saveDocument'
import { loadDocumentFromFile } from '../fileformat/io/loadDocument'

function confirmDiscardIfDirty(): boolean {
  if (!useDocumentStore.getState().dirty) return true
  return window.confirm('You have unsaved changes. Discard them and continue?')
}

export default function FileMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNew = () => {
    if (!confirmDiscardIfDirty()) return
    createNewDocument()
    notifications.show({ message: 'Started a new document', color: 'blue' })
  }

  const handleOpenClick = () => {
    if (!confirmDiscardIfDirty()) return
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await loadDocumentFromFile(file)
      notifications.show({ message: `Opened "${file.name}"`, color: 'green' })
    } catch (err) {
      notifications.show({
        title: 'Could not open file',
        message: err instanceof Error ? err.message : String(err),
        color: 'red',
      })
    }
  }

  const handleSave = async (saveAs: boolean) => {
    useDocumentStore.getState().setSaving(true)
    try {
      const result = await saveDocument({ saveAs })
      if (result.saved) {
        notifications.show({ message: 'Saved', color: 'green' })
      }
    } catch (err) {
      notifications.show({
        title: 'Could not save file',
        message: err instanceof Error ? err.message : String(err),
        color: 'red',
      })
    } finally {
      useDocumentStore.getState().setSaving(false)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ond"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />
      <Menu shadow="md" width={180}>
        <Menu.Target>
          <Button variant="subtle" size="xs" rightSection={<IconChevronDown size={14} />}>
            File
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconFile size={14} />} onClick={handleNew}>
            New
          </Menu.Item>
          <Menu.Item leftSection={<IconFolderOpen size={14} />} onClick={handleOpenClick}>
            Open...
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item leftSection={<IconDeviceFloppy size={14} />} onClick={() => handleSave(false)}>
            Save
          </Menu.Item>
          <Menu.Item leftSection={<IconDeviceFloppy size={14} />} onClick={() => handleSave(true)}>
            Save As...
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  )
}
