import type { StateCreator } from 'zustand'

/** Node selection carries every selected id (ctrl/shift-click adds to it); edge selection stays single. */
export type Selection = { kind: 'node'; ids: string[] } | { kind: 'edge'; id: string } | null
export type AppMode = 'diagram' | 'knowledgebase' | 'services'

export interface UiSlice {
  mode: AppMode
  activeSheetId: string
  activeKbPageId: string | null
  selection: Selection
  focusNodeId: string | null
  /** VLAN ID to highlight matching devices/VLAN nodes/edges for; null when nothing is highlighted. */
  highlightVlanId: number | null
  dirty: boolean
  /** True from the moment a save is kicked off until it settles — drives the header's "Saving..." indicator. */
  saving: boolean
  setMode: (mode: AppMode) => void
  setActiveSheet: (sheetId: string) => void
  setActiveKbPage: (pageId: string | null) => void
  select: (selection: Selection) => void
  /** Ctrl/shift-click a node: adds it to the current multi-selection, or removes it if already in there. */
  toggleNodeSelection: (nodeId: string) => void
  clearSelection: () => void
  setFocusNode: (nodeId: string | null) => void
  setHighlightVlanId: (vlanId: number | null) => void
  markDirty: () => void
  markClean: () => void
  setSaving: (saving: boolean) => void
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  mode: 'diagram',
  activeSheetId: '',
  activeKbPageId: null,
  selection: null,
  focusNodeId: null,
  highlightVlanId: null,
  dirty: false,
  saving: false,
  setMode: (mode) => set({ mode }),
  setActiveSheet: (sheetId) => set({ activeSheetId: sheetId, selection: null }),
  setActiveKbPage: (pageId) => set({ activeKbPageId: pageId }),
  select: (selection) => set({ selection }),
  toggleNodeSelection: (nodeId) =>
    set((state) => {
      if (state.selection?.kind !== 'node') return { selection: { kind: 'node', ids: [nodeId] } }
      const ids = state.selection.ids.includes(nodeId)
        ? state.selection.ids.filter((id) => id !== nodeId)
        : [...state.selection.ids, nodeId]
      return { selection: ids.length > 0 ? { kind: 'node', ids } : null }
    }),
  clearSelection: () => set({ selection: null }),
  setFocusNode: (nodeId) => set({ focusNodeId: nodeId }),
  setHighlightVlanId: (vlanId) => set({ highlightVlanId: vlanId }),
  markDirty: () => set({ dirty: true }),
  markClean: () => set({ dirty: false }),
  setSaving: (saving) => set({ saving }),
})
