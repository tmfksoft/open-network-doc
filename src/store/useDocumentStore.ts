import { create } from 'zustand'
import { createMetaSlice, type MetaSlice } from './slices/metaSlice'
import { createSheetsSlice, type SheetsSlice } from './slices/sheetsSlice'
import { createNodesSlice, type NodesSlice } from './slices/nodesSlice'
import { createUiSlice, type UiSlice } from './slices/uiSlice'
import { createKbSlice, type KbSlice } from './slices/kbSlice'

export type DocumentStore = MetaSlice & SheetsSlice & NodesSlice & UiSlice & KbSlice

export const useDocumentStore = create<DocumentStore>()((...a) => ({
  ...createMetaSlice(...a),
  ...createSheetsSlice(...a),
  ...createNodesSlice(...a),
  ...createUiSlice(...a),
  ...createKbSlice(...a),
}))

// Seed a single starter sheet so the canvas always has somewhere to render.
const initialSheetId = useDocumentStore.getState().addSheet('Overview')
useDocumentStore.getState().setActiveSheet(initialSheetId)
useDocumentStore.getState().markClean()
