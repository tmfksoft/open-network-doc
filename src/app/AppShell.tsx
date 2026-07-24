import { AppShell as MantineAppShell, Group, Badge } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import ReactFlowCanvas from '../canvas/ReactFlowCanvas'
import InspectorPanel from '../sidebar/InspectorPanel'
import SheetList from '../sheets/SheetList'
import FileMenu from './FileMenu'
import DocTitle from './DocTitle'
import ModeSwitch from './ModeSwitch'
import DropZoneOverlay from './DropZoneOverlay'
import { useBeforeUnloadWarning } from './useBeforeUnloadWarning'
import KbNav from '../kb/KbNav'
import KbPageView from '../kb/KbPageView'

export default function AppShell() {
  const dirty = useDocumentStore((s) => s.dirty)
  const selection = useDocumentStore((s) => s.selection)
  const mode = useDocumentStore((s) => s.mode)

  useBeforeUnloadWarning()

  const asideOpen = mode === 'diagram' && selection !== null

  return (
    <DropZoneOverlay>
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
              <FileMenu />
              <DocTitle />
              {dirty && (
                <Badge size="xs" color="yellow" variant="light">
                  unsaved
                </Badge>
              )}
            </Group>
            <ModeSwitch />
          </Group>
        </MantineAppShell.Header>

        <MantineAppShell.Navbar>{mode === 'diagram' ? <SheetList /> : <KbNav />}</MantineAppShell.Navbar>

        <MantineAppShell.Main style={{ height: 'calc(100vh - 48px)', overflow: 'auto' }}>
          {mode === 'diagram' ? <ReactFlowCanvas /> : <KbPageView />}
        </MantineAppShell.Main>

        <MantineAppShell.Aside>
          <InspectorPanel />
        </MantineAppShell.Aside>
      </MantineAppShell>
    </DropZoneOverlay>
  )
}
