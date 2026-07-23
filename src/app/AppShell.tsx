import { AppShell as MantineAppShell, Group, Text, Badge } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import ReactFlowCanvas from '../canvas/ReactFlowCanvas'
import InspectorPanel from '../sidebar/InspectorPanel'
import SheetList from '../sheets/SheetList'

export default function AppShell() {
  const docTitle = useDocumentStore((s) => s.docTitle)
  const dirty = useDocumentStore((s) => s.dirty)
  const selection = useDocumentStore((s) => s.selection)

  const asideOpen = selection !== null

  return (
    <MantineAppShell
      header={{ height: 48 }}
      navbar={{ width: 220, breakpoint: 'sm' }}
      aside={{
        width: 320,
        breakpoint: 'sm',
        collapsed: { desktop: !asideOpen, mobile: !asideOpen },
      }}
      padding={0}
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Text fw={700}>{docTitle}</Text>
            {dirty && (
              <Badge size="xs" color="yellow" variant="light">
                unsaved
              </Badge>
            )}
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar>
        <SheetList />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main style={{ height: 'calc(100vh - 48px)' }}>
        <ReactFlowCanvas />
      </MantineAppShell.Main>

      <MantineAppShell.Aside>
        <InspectorPanel />
      </MantineAppShell.Aside>
    </MantineAppShell>
  )
}
