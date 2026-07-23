import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Paper, Stack, Text, ThemeIcon } from '@mantine/core'
import type { DeviceData } from '../../fileformat/types'
import { DeviceTypeIcon } from './deviceIcons'
import { DEVICE_TYPE_LABELS } from './deviceIconMap'

const HANDLE_POSITIONS = [Position.Top, Position.Right, Position.Bottom, Position.Left]

export default function DeviceNode({ data, selected }: NodeProps) {
  const device = data as unknown as DeviceData & { label: string }

  return (
    <Paper
      withBorder
      shadow={selected ? 'md' : 'xs'}
      radius="md"
      p="sm"
      w={180}
      style={{
        borderColor: selected ? 'var(--mantine-color-blue-6)' : undefined,
        borderWidth: selected ? 2 : 1,
      }}
    >
      {HANDLE_POSITIONS.flatMap((pos) => [
        <Handle key={`${pos}-source`} id={`${pos}-source`} type="source" position={pos} />,
        <Handle key={`${pos}-target`} id={`${pos}-target`} type="target" position={pos} />,
      ])}
      <Stack gap={4} align="center">
        <ThemeIcon variant="light" size={40} radius="md">
          <DeviceTypeIcon deviceType={device.deviceType} size={24} />
        </ThemeIcon>
        <Text fw={600} size="sm" ta="center" truncate style={{ width: '100%' }}>
          {device.label}
        </Text>
        <Text size="xs" c="dimmed" ta="center">
          {DEVICE_TYPE_LABELS[device.deviceType ?? 'other']}
        </Text>
      </Stack>
    </Paper>
  )
}
