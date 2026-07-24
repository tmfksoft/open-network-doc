import { Menu } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
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
}

const MENU_ITEMS: { type: NodeType; label: string }[] = [
  { type: 'device', label: 'Device' },
  { type: 'network_group', label: 'Network Group' },
  { type: 'vlan', label: 'VLAN' },
  { type: 'ip_range', label: 'IP Range' },
  { type: 'group_header', label: 'Group' },
  { type: 'sheet_portal', label: 'Sheet Link' },
]

export default function PaneContextMenu({ state, onClose, onAddNode }: PaneContextMenuProps) {
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
