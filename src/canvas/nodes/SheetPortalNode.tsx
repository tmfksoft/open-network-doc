import type { NodeProps } from '@xyflow/react'
import { Stack, Text, ThemeIcon, Button } from '@mantine/core'
import type { SheetPortalDocNode } from '../../fileformat/types'
import { NodeCard } from './NodeCard'
import { SHEET_PORTAL_ICON } from './nodeTypeMeta'
import { useDocumentStore } from '../../store/useDocumentStore'

export default function SheetPortalNode({ data, selected }: NodeProps) {
  const { docNode, handlesVisible } = data as unknown as { docNode: SheetPortalDocNode; handlesVisible?: boolean }
  const portal = docNode.data
  const Icon = SHEET_PORTAL_ICON
  const sheets = useDocumentStore((s) => s.sheets)
  const setActiveSheet = useDocumentStore((s) => s.setActiveSheet)
  const setFocusNode = useDocumentStore((s) => s.setFocusNode)

  const targetSheet = sheets.find((s) => s.id === portal.targetSheetId)

  const handleGo = () => {
    if (!portal.targetSheetId) return
    setActiveSheet(portal.targetSheetId)
    setFocusNode(portal.targetNodeId ?? null)
  }

  return (
    <NodeCard node={docNode} selected={selected} handlesVisible={handlesVisible}>
      <Stack gap={4} align="center" justify="center" h="100%">
        <ThemeIcon variant="light" size={40} radius="md">
          <Icon size={24} />
        </ThemeIcon>
        <Text fw={600} size="sm" ta="center" truncate style={{ width: '100%' }}>
          {portal.labelOverride || docNode.label}
        </Text>
        <Text size="xs" c="dimmed" ta="center" truncate style={{ width: '100%' }}>
          {targetSheet ? `→ ${targetSheet.name}` : 'Not linked'}
        </Text>
        <Button
          size="compact-xs"
          variant="light"
          disabled={!portal.targetSheetId}
          className="nodrag"
          onClick={handleGo}
        >
          Go
        </Button>
      </Stack>
    </NodeCard>
  )
}
