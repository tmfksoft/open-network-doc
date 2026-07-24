import { useState } from 'react'
import { Text, TextInput } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'

export default function DocTitle() {
  const docTitle = useDocumentStore((s) => s.docTitle)
  const setDocTitle = useDocumentStore((s) => s.setDocTitle)
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <TextInput
        size="xs"
        autoFocus
        defaultValue={docTitle}
        onBlur={(e) => {
          setDocTitle(e.currentTarget.value || docTitle)
          setEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <Text fw={700} onDoubleClick={() => setEditing(true)} style={{ cursor: 'text' }}>
      {docTitle}
    </Text>
  )
}
