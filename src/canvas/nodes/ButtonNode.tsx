import type { MouseEvent } from 'react'
import { NodeResizer, type NodeProps } from '@xyflow/react'
import { useDocumentStore } from '../../store/useDocumentStore'
import type { ButtonDocNode } from '../../fileformat/types'
import { BUTTON_LINK_TYPE_ICONS } from './nodeTypeMeta'
import NodeHoverCard from '../popovers/NodeHoverCard'

export const BUTTON_NODE_DEFAULT_WIDTH = 160
export const BUTTON_NODE_DEFAULT_HEIGHT = 50
const MIN_WIDTH = 80
const MIN_HEIGHT = 32

const DEFAULT_BUTTON_COLOR = '#1971c2'

/** Pure navigation trigger: no connection handles, like the markdown note. */
export default function ButtonNode({ data, selected }: NodeProps) {
  const { docNode } = data as unknown as { docNode: ButtonDocNode }
  const setMode = useDocumentStore((s) => s.setMode)
  const setActiveSheet = useDocumentStore((s) => s.setActiveSheet)
  const setActiveKbPage = useDocumentStore((s) => s.setActiveKbPage)

  const { linkType, url, targetSheetId, targetKbPageId, color } = docNode.data
  const Icon = linkType ? BUTTON_LINK_TYPE_ICONS[linkType] : undefined

  const handleClick = (e: MouseEvent) => {
    // A click activates the link; it should never also select the node —
    // otherwise the click bubbling up to React Flow's node handler selects
    // this node just as (or after) navigation already swapped the active
    // sheet/mode out from under it, leaving the aside open on a selection
    // that no longer resolves to anything. Select it via right-click instead.
    e.stopPropagation()
    if (linkType === 'website' && url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else if (linkType === 'sheet' && targetSheetId) {
      setActiveSheet(targetSheetId)
    } else if (linkType === 'kb_article' && targetKbPageId) {
      setMode('knowledgebase')
      setActiveKbPage(targetKbPageId)
    }
  }

  return (
    <NodeHoverCard node={docNode}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <NodeResizer
          isVisible={selected}
          minWidth={MIN_WIDTH}
          minHeight={MIN_HEIGHT}
          lineStyle={{ borderColor: 'var(--mantine-color-blue-6)' }}
          handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
        />
        <button
          type="button"
          onClick={handleClick}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderRadius: 8,
            border: selected ? '2px solid var(--mantine-color-blue-4)' : '1px solid rgba(255, 255, 255, 0.15)',
            background: color ?? DEFAULT_BUTTON_COLOR,
            color: 'white',
            fontWeight: 600,
            fontSize: 14,
            fontFamily: 'inherit',
            cursor: 'pointer',
            padding: '0 12px',
            overflow: 'hidden',
          }}
        >
          {Icon && <Icon size={16} style={{ flexShrink: 0 }} />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docNode.label}</span>
        </button>
      </div>
    </NodeHoverCard>
  )
}
