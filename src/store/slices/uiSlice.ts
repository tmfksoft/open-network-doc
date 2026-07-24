import type { StateCreator } from 'zustand'

export type Selection = { kind: 'node' | 'edge'; id: string } | null
export type AppMode = 'diagram' | 'knowledgebase'

export interface UiSlice {
  mode: AppMode
  activeSheetId: string
  activeKbPageId: string | null
  selection: Selection
  focusNodeId: string | null
  /** VLAN ID to highlight matching devices/VLAN nodes/edges for; null when nothing is highlighted. */
  highlightVlanId: number | null
  dirty: boolean
  setMode: (mode: AppMode) => void
  setActiveSheet: (sheetId: string) => void
  setActiveKbPage: (pageId: string | null) => void
  select: (selection: Selection) => void
  clearSelection: () => void
  setFocusNode: (nodeId: string | null) => void
  setHighlightVlanId: (vlanId: number | null) => void
  markDirty: () => void
  markClean: () => void
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  mode: 'diagram',
  activeSheetId: '',
  activeKbPageId: null,
  selection: null,
  focusNodeId: null,
  highlightVlanId: null,
  dirty: false,
  setMode: (mode) => set({ mode }),
  setActiveSheet: (sheetId) => set({ activeSheetId: sheetId, selection: null }),
  setActiveKbPage: (pageId) => set({ activeKbPageId: pageId }),
  select: (selection) => set({ selection }),
  clearSelection: () => set({ selection: null }),
  setFocusNode: (nodeId) => set({ focusNodeId: nodeId }),
  setHighlightVlanId: (vlanId) => set({ highlightVlanId: vlanId }),
  markDirty: () => set({ dirty: true }),
  markClean: () => set({ dirty: false }),
})
