import { SegmentedControl } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import type { AppMode } from '../store/slices/uiSlice'

export default function ModeSwitch() {
  const mode = useDocumentStore((s) => s.mode)
  const setMode = useDocumentStore((s) => s.setMode)

  return (
    <SegmentedControl
      size="xs"
      value={mode}
      onChange={(value) => setMode(value as AppMode)}
      data={[
        { label: 'Diagram', value: 'diagram' },
        { label: 'Knowledgebase', value: 'knowledgebase' },
        { label: 'Services', value: 'services' },
      ]}
    />
  )
}
