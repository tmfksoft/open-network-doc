import { useEffect, useState, type ReactNode } from 'react'
import { Center, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconFileUpload } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useDocumentStore } from '../store/useDocumentStore'
import { loadDocumentFromFile } from '../fileformat/io/loadDocument'

export default function DropZoneOverlay({ children }: { children: ReactNode }) {
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    let dragCounter = 0

    const hasFiles = (e: DragEvent) =>
      !!e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      dragCounter += 1
      setDragActive(true)
    }
    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
    }
    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return
      dragCounter = Math.max(0, dragCounter - 1)
      if (dragCounter === 0) setDragActive(false)
    }
    const onDrop = async (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      dragCounter = 0
      setDragActive(false)

      if (useDocumentStore.getState().dirty) {
        const proceed = window.confirm('You have unsaved changes. Discard them and continue?')
        if (!proceed) return
      }

      const file = e.dataTransfer?.files?.[0]
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

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [])

  return (
    <>
      {children}
      {dragActive && (
        <Center
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(0, 0, 0, 0.7)',
            border: '3px dashed var(--mantine-color-blue-6)',
            pointerEvents: 'none',
          }}
        >
          <Stack align="center" gap="xs">
            <ThemeIcon size={64} radius="xl" variant="light">
              <IconFileUpload size={32} />
            </ThemeIcon>
            <Text size="lg" fw={600}>
              Drop a .ond file to open it
            </Text>
          </Stack>
        </Center>
      )}
    </>
  )
}
