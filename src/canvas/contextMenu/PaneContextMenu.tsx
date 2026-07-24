import { Menu } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { IconClipboard } from '@tabler/icons-react'
import type { NodeType } from '../../fileformat/types'

export interface PaneContextMenuState {
  clientX: number
  clientY: number
  flowX: number
  flowY: number
}

interface PaneContextMenuProps {
  state: PaneContextMenuState | null
  onClose: () => void
  onAddNode: (type: NodeType, flowX: number, flowY: number) => void
  /** Present only when the clipboard has a node to paste. */
  onPaste?: (flowX: number, flowY: number) => void
}

const MENU_ITEMS: { type: NodeType; label: string }[] = [
  { type: 'device', label: 'Device' },
  { type: 'network_group', label: 'Network Group' },
  { type: 'vlan', label: 'VLAN' },
  { type: 'ip_range', label: 'IP Range' },
  { type: 'group_header', label: 'Group' },
  { type: 'sheet_portal', label: 'Sheet Link' },
  { type: 'markdown', label: 'Markdown Note' },
]

export default function PaneContextMenu({ state, onClose, onAddNode, onPaste }: PaneContextMenuProps) {
  const ref = useClickOutside(onClose)

  if (!state) return null

  return (
    <Menu opened shadow="md" width={200} onClose={onClose} closeOnItemClick>
      <Menu.Target>
        <div
          style={{
            position: 'fixed',
            left: state.clientX,
            top: state.clientY,
            width: 1,
            height: 1,
          }}
        />
      </Menu.Target>
      <Menu.Dropdown ref={ref}>
        {onPaste && (
          <>
            <Menu.Item leftSection={<IconClipboard size={14} />} onClick={() => onPaste(state.flowX, state.flowY)}>
              Paste
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        <Menu.Label>Add to sheet</Menu.Label>
        {MENU_ITEMS.map((item) => (
          <Menu.Item key={item.type} onClick={() => onAddNode(item.type, state.flowX, state.flowY)}>
            {item.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
