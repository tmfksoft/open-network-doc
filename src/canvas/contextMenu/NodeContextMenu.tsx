import { Menu } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { IconCopy, IconCopyPlus, IconTrash } from '@tabler/icons-react'

export interface NodeContextMenuState {
  clientX: number
  clientY: number
  nodeId: string
}

interface NodeContextMenuProps {
  state: NodeContextMenuState | null
  onClose: () => void
  onCopy: (nodeId: string) => void
  onDuplicate: (nodeId: string) => void
  onDelete: (nodeId: string) => void
}

export default function NodeContextMenu({ state, onClose, onCopy, onDuplicate, onDelete }: NodeContextMenuProps) {
  const ref = useClickOutside(onClose)

  if (!state) return null

  return (
    <Menu opened shadow="md" width={180} onClose={onClose} closeOnItemClick>
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
        <Menu.Item leftSection={<IconCopy size={14} />} onClick={() => onCopy(state.nodeId)}>
          Copy
        </Menu.Item>
        <Menu.Item leftSection={<IconCopyPlus size={14} />} onClick={() => onDuplicate(state.nodeId)}>
          Duplicate
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(state.nodeId)}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
