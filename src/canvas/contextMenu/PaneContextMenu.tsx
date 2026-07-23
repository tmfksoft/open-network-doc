import { Menu } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'

export interface PaneContextMenuState {
  clientX: number
  clientY: number
  flowX: number
  flowY: number
}

interface PaneContextMenuProps {
  state: PaneContextMenuState | null
  onClose: () => void
  onAddDevice: (flowX: number, flowY: number) => void
  onAddGroup: (flowX: number, flowY: number) => void
}

export default function PaneContextMenu({
  state,
  onClose,
  onAddDevice,
  onAddGroup,
}: PaneContextMenuProps) {
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
        <Menu.Item onClick={() => onAddDevice(state.flowX, state.flowY)}>Device</Menu.Item>
        <Menu.Item onClick={() => onAddGroup(state.flowX, state.flowY)}>Group</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
