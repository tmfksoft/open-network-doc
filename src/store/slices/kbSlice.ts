import type { StateCreator } from 'zustand'
import type { DocumentStore } from '../useDocumentStore'
import type { KbPage } from '../../fileformat/types'

export interface KbSlice {
  kbPages: KbPage[]
  addKbPage: (title: string, folderPath?: string) => string
  updateKbPage: (pageId: string, patch: Partial<KbPage>) => void
  removeKbPage: (pageId: string) => void
}

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'page'
}

export const createKbSlice: StateCreator<DocumentStore, [], [], KbSlice> = (set, get) => ({
  kbPages: [],

  addKbPage: (title, folderPath) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const existingSlugs = new Set(get().kbPages.map((p) => p.slug))
    const base = slugify(title)
    let slug = base
    let n = 2
    while (existingSlugs.has(slug)) slug = `${base}-${n++}`

    const page: KbPage = {
      id,
      slug,
      title,
      folderPath,
      orderIndex: get().kbPages.length,
      content: '',
      tags: [],
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ kbPages: [...state.kbPages, page], dirty: true }))
    return id
  },

  updateKbPage: (pageId, patch) => {
    set((state) => ({
      kbPages: state.kbPages.map((p) =>
        p.id === pageId ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
      ),
      dirty: true,
    }))
  },

  removeKbPage: (pageId) => {
    set((state) => ({
      kbPages: state.kbPages.filter((p) => p.id !== pageId),
      activeKbPageId: state.activeKbPageId === pageId ? null : state.activeKbPageId,
      dirty: true,
    }))
  },
})
