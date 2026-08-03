import { useMemo, useState } from 'react'
import { Stack, TextInput, Table, Text, Badge } from '@mantine/core'
import { IconSearch, IconWorld } from '@tabler/icons-react'
import { useDocumentStore } from '../store/useDocumentStore'
import type { DeviceDocNode, DeviceService } from '../fileformat/types'
import { formatServicePortRange } from '../utils/services'

interface ServiceRow {
  service: DeviceService
  deviceId: string
  deviceLabel: string
  sheetId: string
  sheetName: string
}

export default function ServicesView() {
  const sheets = useDocumentStore((s) => s.sheets)
  const nodesBySheet = useDocumentStore((s) => s.nodesBySheet)
  const setActiveSheet = useDocumentStore((s) => s.setActiveSheet)
  const setMode = useDocumentStore((s) => s.setMode)
  const select = useDocumentStore((s) => s.select)
  const setFocusNode = useDocumentStore((s) => s.setFocusNode)

  const [search, setSearch] = useState('')

  const rows = useMemo<ServiceRow[]>(() => {
    const result: ServiceRow[] = []
    for (const sheet of sheets) {
      for (const node of nodesBySheet[sheet.id] ?? []) {
        if (node.type !== 'device') continue
        const device = node as DeviceDocNode
        for (const service of device.data.services ?? []) {
          result.push({
            service,
            deviceId: device.id,
            deviceLabel: device.label,
            sheetId: sheet.id,
            sheetName: sheet.name,
          })
        }
      }
    }
    return result
  }, [sheets, nodesBySheet])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.service.name.toLowerCase().includes(q) ||
        r.deviceLabel.toLowerCase().includes(q) ||
        r.sheetName.toLowerCase().includes(q) ||
        r.service.protocol.includes(q) ||
        formatServicePortRange(r.service).includes(q),
    )
  }, [rows, search])

  const goToDevice = (row: ServiceRow) => {
    setActiveSheet(row.sheetId)
    select({ kind: 'node', id: row.deviceId })
    setFocusNode(row.deviceId)
    setMode('diagram')
  }

  return (
    <Stack p="md" gap="sm">
      <TextInput
        placeholder="Search services..."
        leftSection={<IconSearch size={14} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        maw={400}
      />
      {rows.length === 0 ? (
        <Text c="dimmed" size="sm">
          No services defined yet. Add one from a device's inspector.
        </Text>
      ) : filtered.length === 0 ? (
        <Text c="dimmed" size="sm">
          No matching services.
        </Text>
      ) : (
        <Table highlightOnHover verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Service</Table.Th>
              <Table.Th>Port</Table.Th>
              <Table.Th>Protocol</Table.Th>
              <Table.Th>Public</Table.Th>
              <Table.Th>Device</Table.Th>
              <Table.Th>Sheet</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((row) => (
              <Table.Tr key={row.service.id} onClick={() => goToDevice(row)} style={{ cursor: 'pointer' }}>
                <Table.Td>
                  {row.service.name || (
                    <Text c="dimmed" component="span">
                      Unnamed service
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>{formatServicePortRange(row.service)}</Table.Td>
                <Table.Td>
                  <Badge size="xs" variant="light">
                    {row.service.protocol.toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {row.service.public ? (
                    <Badge size="xs" color="orange" variant="light" leftSection={<IconWorld size={10} />}>
                      Public
                    </Badge>
                  ) : (
                    <Text size="xs" c="dimmed">
                      Internal
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>{row.deviceLabel}</Table.Td>
                <Table.Td>{row.sheetName}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  )
}
