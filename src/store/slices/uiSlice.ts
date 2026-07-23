import type { StateCreator } from 'zustand'

export type Selection = { kind: 'node' | 'edge'; id: string } | null

export interface UiSlice {
  activeSheetId: string
  selection: Selection
  focusNodeId: string | null
  dirty: boolean
  setActiveSheet: (sheetId: string) => void
  select: (selection: Selection) => void
  clearSelection: () => void
  setFocusNode: (nodeId: string | null) => void
  markDirty: () => void
  markClean: () => void
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  activeSheetId: '',
  selection: null,
  focusNodeId: null,
  dirty: false,
  setActiveSheet: (sheetId) => set({ activeSheetId: sheetId, selection: null }),
  select: (selection) => set({ selection }),
  clearSelection: () => set({ selection: null }),
  setFocusNode: (nodeId) => set({ focusNodeId: nodeId }),
  markDirty: () => set({ dirty: true }),
  markClean: () => set({ dirty: false }),
})
