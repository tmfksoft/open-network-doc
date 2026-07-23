import { IconFolder, type IconProps } from '@tabler/icons-react'
import { GROUP_ICONS, type GroupIconKey } from './groupIconMap'

export function GroupTypeIcon({ icon, ...props }: IconProps & { icon?: string }) {
  const Icon = (icon && GROUP_ICONS[icon as GroupIconKey]) || IconFolder
  return <Icon {...props} />
}
