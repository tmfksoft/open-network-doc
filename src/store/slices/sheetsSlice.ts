import type { StateCreator } from 'zustand'
import type { DocumentStore } from '../useDocumentStore'
import type { Sheet } from '../../fileformat/types'

export interface SheetsSlice {
  sheets: Sheet[]
  addSheet: (name?: string) => string
  renameSheet: (sheetId: string, name: string) => void
  removeSheet: (sheetId: string) => void
}

export const createSheetsSlice: StateCreator<DocumentStore, [], [], SheetsSlice> = (
  set,
  get,
) => ({
  sheets: [],
  addSheet: (name) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const sheet: Sheet = {
      id,
      name: name ?? `Sheet ${get().sheets.length + 1}`,
      orderIndex: get().sheets.length,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({
      sheets: [...state.sheets, sheet],
      nodesBySheet: { ...state.nodesBySheet, [id]: [] },
      edgesBySheet: { ...state.edgesBySheet, [id]: [] },
      dirty: true,
    }))
    return id
  },
  renameSheet: (sheetId, name) => {
    set((state) => ({
      sheets: state.sheets.map((s) =>
        s.id === sheetId ? { ...s, name, updatedAt: new Date().toISOString() } : s,
      ),
      dirty: true,
    }))
  },
  removeSheet: (sheetId) => {
    set((state) => {
      const sheets = state.sheets.filter((s) => s.id !== sheetId)
      const nodesBySheet = Object.fromEntries(
        Object.entries(state.nodesBySheet).filter(([id]) => id !== sheetId),
      )
      const edgesBySheet = Object.fromEntries(
        Object.entries(state.edgesBySheet).filter(([id]) => id !== sheetId),
      )
      const activeSheetId =
        state.activeSheetId === sheetId ? (sheets[0]?.id ?? '') : state.activeSheetId
      return { sheets, nodesBySheet, edgesBySheet, activeSheetId, dirty: true }
    })
  },
})
