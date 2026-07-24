import { useCallback } from 'react'
import { AppShell as MantineAppShell, Group, Badge, Loader } from '@mantine/core'
import { useDocumentStore } from '../store/useDocumentStore'
import { useUiPrefsStore } from '../store/useUiPrefsStore'
import ReactFlowCanvas from '../canvas/ReactFlowCanvas'
import InspectorPanel from '../sidebar/InspectorPanel'
import SheetList from '../sheets/SheetList'
import FileMenu from './FileMenu'
import DocTitle from './DocTitle'
import ModeSwitch from './ModeSwitch'
import DropZoneOverlay from './DropZoneOverlay'
import { useBeforeUnloadWarning } from './useBeforeUnloadWarning'
import { useOpenFromUrlParam } from './useOpenFromUrlParam'
import KbNav from '../kb/KbNav'
import KbPageView from '../kb/KbPageView'

export default function AppShell() {
  const dirty = useDocumentStore((s) => s.dirty)
  const saving = useDocumentStore((s) => s.saving)
  const selection = useDocumentStore((s) => s.selection)
  const mode = useDocumentStore((s) => s.mode)
  const navbarWidth = useUiPrefsStore((s) => s.navbarWidth)
  const setNavbarWidth = useUiPrefsStore((s) => s.setNavbarWidth)

  useBeforeUnloadWarning()
  useOpenFromUrlParam()

  const asideOpen = mode === 'diagram' && selection !== null

  // Drag-to-resize the navbar: track the width at drag start and the
  // pointer's total movement since, rather than accumulating per-move
  // deltas, so the width never drifts from what the cursor actually did.
  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = navbarWidth

      function handleMouseMove(moveEvent: MouseEvent) {
        setNavbarWidth(startWidth + (moveEvent.clientX - startX))
      }
      function handleMouseUp() {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [navbarWidth, setNavbarWidth],
  )

  return (
    <DropZoneOverlay>
      <MantineAppShell
        header={{ height: 48 }}
        navbar={{ width: navbarWidth, breakpoint: 'sm' }}
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
              {saving ? (
                <Badge size="xs" color="blue" variant="light" leftSection={<Loader size={10} color="blue" />}>
                  Saving...
                </Badge>
              ) : (
                dirty && (
                  <Badge size="xs" color="yellow" variant="light">
                    unsaved
                  </Badge>
                )
              )}
            </Group>
            <ModeSwitch />
          </Group>
        </MantineAppShell.Header>

        <MantineAppShell.Navbar style={{ overflowY: 'auto' }}>
          {mode === 'diagram' ? <SheetList /> : <KbNav />}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            onMouseDown={handleResizeStart}
            className="app-navbar-resize-handle"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: 6,
              cursor: 'col-resize',
              zIndex: 10,
            }}
          />
        </MantineAppShell.Navbar>

        <MantineAppShell.Main style={{ height: 'calc(100vh - 48px)', overflow: 'auto' }}>
          {mode === 'diagram' ? <ReactFlowCanvas /> : <KbPageView />}
        </MantineAppShell.Main>

        <MantineAppShell.Aside style={{ overflowY: 'auto' }}>
          <InspectorPanel />
        </MantineAppShell.Aside>
      </MantineAppShell>
    </DropZoneOverlay>
  )
}
