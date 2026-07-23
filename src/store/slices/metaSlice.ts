import type { StateCreator } from 'zustand'

export interface MetaSlice {
  docId: string
  docTitle: string
  setDocTitle: (title: string) => void
}

export const createMetaSlice: StateCreator<MetaSlice, [], [], MetaSlice> = (set) => ({
  docId: crypto.randomUUID(),
  docTitle: 'Untitled Network Document',
  setDocTitle: (title) => set({ docTitle: title }),
})
