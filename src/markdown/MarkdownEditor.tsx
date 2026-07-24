import { useEffect, useRef, useState } from 'react'
import { Stack, Group, Tabs, Textarea, ActionIcon, Text } from '@mantine/core'
import { IconBold, IconItalic, IconLink, IconPhoto } from '@tabler/icons-react'
import { registerAsset } from '../assets-runtime/assetStore'
import MarkdownRenderer from './MarkdownRenderer'

interface MarkdownEditorProps {
  value: string
  onCommit: (value: string) => void
  placeholder?: string
  minRows?: number
}

export default function MarkdownEditor({
  value,
  onCommit,
  placeholder = 'Markdown description...',
  minRows = 6,
}: MarkdownEditorProps) {
  const [text, setText] = useState(value)
  const [tab, setTab] = useState<string | null>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setText(value), [value])

  const insertAtCursor = (before: string, after = '') => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = text.slice(start, end)
    const next = text.slice(0, start) + before + selected + after + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      el.focus()
      const cursor = start + before.length + selected.length + after.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  const insertImage = (file: File) => {
    const id = registerAsset(file)
    insertAtCursor(`![](asset://${id})`)
  }

  return (
    <Stack gap={4}>
      <Tabs value={tab} onChange={setTab}>
        <Group justify="space-between" wrap="nowrap">
          <Tabs.List>
            <Tabs.Tab value="write">Write</Tabs.Tab>
            <Tabs.Tab value="preview">Preview</Tabs.Tab>
          </Tabs.List>
          {tab === 'write' && (
            <Group gap={2}>
              <ActionIcon variant="subtle" size="sm" aria-label="Bold" onClick={() => insertAtCursor('**', '**')}>
                <IconBold size={14} />
              </ActionIcon>
              <ActionIcon variant="subtle" size="sm" aria-label="Italic" onClick={() => insertAtCursor('*', '*')}>
                <IconItalic size={14} />
              </ActionIcon>
              <ActionIcon variant="subtle" size="sm" aria-label="Link" onClick={() => insertAtCursor('[', '](url)')}>
                <IconLink size={14} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                size="sm"
                aria-label="Insert image"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconPhoto size={14} />
              </ActionIcon>
            </Group>
          )}
        </Group>

        <Tabs.Panel value="write" pt={4}>
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            onBlur={() => onCommit(text)}
            onPaste={(e) => {
              const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
                i.type.startsWith('image/'),
              )
              if (!item) return
              const file = item.getAsFile()
              if (!file) return
              e.preventDefault()
              insertImage(file)
            }}
            onDrop={(e) => {
              const file = Array.from(e.dataTransfer?.files ?? []).find((f) =>
                f.type.startsWith('image/'),
              )
              if (!file) return
              e.preventDefault()
              insertImage(file)
            }}
            placeholder={placeholder}
            minRows={minRows}
            autosize
          />
        </Tabs.Panel>

        <Tabs.Panel value="preview" pt={4}>
          {text ? (
            <MarkdownRenderer content={text} />
          ) : (
            <Text size="sm" c="dimmed">
              Nothing to preview.
            </Text>
          )}
        </Tabs.Panel>
      </Tabs>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) insertImage(file)
        }}
      />
    </Stack>
  )
}
