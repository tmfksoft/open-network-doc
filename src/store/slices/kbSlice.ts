import type { StateCreator } from 'zustand'
import type { DocumentStore } from '../useDocumentStore'
import type { KbFolder, KbPage } from '../../fileformat/types'

export interface KbSlice {
  kbPages: KbPage[]
  kbFolders: KbFolder[]
  addKbPage: (title: string, folderId?: string) => string
  updateKbPage: (pageId: string, patch: Partial<KbPage>) => void
  removeKbPage: (pageId: string) => void
  /** Moves a page into `folderId` (null = root), optionally right after `afterPageId` among its new siblings (append if omitted). */
  moveKbPage: (pageId: string, folderId: string | null, afterPageId?: string | null) => void
  addKbFolder: (name: string, parentFolderId?: string) => string
  renameKbFolder: (folderId: string, name: string) => void
  removeKbFolder: (folderId: string) => void
  /** Moves a folder under `parentFolderId` (null = root), optionally right after `afterFolderId` among its new siblings (append if omitted). */
  moveKbFolder: (folderId: string, parentFolderId: string | null, afterFolderId?: string | null) => void
}

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'page'
}

/** Folders may nest at most this many levels deep (a root folder is depth 1). */
export const MAX_KB_FOLDER_DEPTH = 3

function folderDepth(folders: KbFolder[], folderId: string): number {
  let depth = 1
  let current = folders.find((f) => f.id === folderId)
  while (current?.parentFolderId) {
    depth++
    current = folders.find((f) => f.id === current!.parentFolderId)
  }
  return depth
}

/** Longest chain of descendants below `folderId` (0 if it has no subfolders). */
function folderSubtreeDepth(folders: KbFolder[], folderId: string): number {
  const children = folders.filter((f) => f.parentFolderId === folderId)
  if (children.length === 0) return 0
  return 1 + Math.max(...children.map((c) => folderSubtreeDepth(folders, c.id)))
}

/** All descendant folder ids of `rootId`, used to block a folder being dropped into its own subtree. */
function collectDescendantFolderIds(folders: KbFolder[], rootId: string): Set<string> {
  const childrenByParent = new Map<string | undefined, string[]>()
  for (const f of folders) {
    const arr = childrenByParent.get(f.parentFolderId) ?? []
    arr.push(f.id)
    childrenByParent.set(f.parentFolderId, arr)
  }
  const result = new Set<string>()
  const stack = [...(childrenByParent.get(rootId) ?? [])]
  while (stack.length > 0) {
    const id = stack.pop()!
    if (result.has(id)) continue
    result.add(id)
    stack.push(...(childrenByParent.get(id) ?? []))
  }
  return result
}

export const createKbSlice: StateCreator<DocumentStore, [], [], KbSlice> = (set, get) => ({
  kbPages: [],
  kbFolders: [],

  addKbPage: (title, folderId) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const existingSlugs = new Set(get().kbPages.map((p) => p.slug))
    const base = slugify(title)
    let slug = base
    let n = 2
    while (existingSlugs.has(slug)) slug = `${base}-${n++}`

    const siblingCount = get().kbPages.filter((p) => (p.folderId ?? undefined) === folderId).length
    const page: KbPage = {
      id,
      slug,
      title,
      folderId,
      orderIndex: siblingCount,
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

  moveKbPage: (pageId, folderId, afterPageId) => {
    set((state) => {
      const page = state.kbPages.find((p) => p.id === pageId)
      if (!page) return state
      const targetFolderId = folderId ?? undefined

      const siblings = state.kbPages
        .filter((p) => p.id !== pageId && (p.folderId ?? undefined) === targetFolderId)
        .sort((a, b) => a.orderIndex - b.orderIndex)

      let insertAt = siblings.length
      if (afterPageId) {
        const idx = siblings.findIndex((p) => p.id === afterPageId)
        if (idx !== -1) insertAt = idx + 1
      }
      const reordered = [...siblings.slice(0, insertAt), page, ...siblings.slice(insertAt)]
      const orderById = new Map(reordered.map((p, i) => [p.id, i]))
      const now = new Date().toISOString()

      return {
        kbPages: state.kbPages.map((p) => {
          if (p.id === pageId) {
            return { ...p, folderId: targetFolderId, orderIndex: orderById.get(p.id)!, updatedAt: now }
          }
          const order = orderById.get(p.id)
          return order == null ? p : { ...p, orderIndex: order }
        }),
        dirty: true,
      }
    })
  },

  addKbFolder: (name, parentFolderId) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    set((state) => {
      if (parentFolderId && folderDepth(state.kbFolders, parentFolderId) >= MAX_KB_FOLDER_DEPTH) return state
      const siblingCount = state.kbFolders.filter(
        (f) => (f.parentFolderId ?? undefined) === (parentFolderId ?? undefined),
      ).length
      const folder: KbFolder = { id, name, parentFolderId, orderIndex: siblingCount, createdAt: now, updatedAt: now }
      return { kbFolders: [...state.kbFolders, folder], dirty: true }
    })
    return id
  },

  renameKbFolder: (folderId, name) => {
    set((state) => ({
      kbFolders: state.kbFolders.map((f) =>
        f.id === folderId ? { ...f, name, updatedAt: new Date().toISOString() } : f,
      ),
      dirty: true,
    }))
  },

  removeKbFolder: (folderId) => {
    set((state) => {
      const folder = state.kbFolders.find((f) => f.id === folderId)
      if (!folder) return state
      const now = new Date().toISOString()
      // Promote direct children (subfolders and pages) up to the removed
      // folder's own parent, rather than deleting its contents.
      return {
        kbFolders: state.kbFolders
          .filter((f) => f.id !== folderId)
          .map((f) => (f.parentFolderId === folderId ? { ...f, parentFolderId: folder.parentFolderId, updatedAt: now } : f)),
        kbPages: state.kbPages.map((p) =>
          p.folderId === folderId ? { ...p, folderId: folder.parentFolderId, updatedAt: now } : p,
        ),
        dirty: true,
      }
    })
  },

  moveKbFolder: (folderId, parentFolderId, afterFolderId) => {
    set((state) => {
      const folder = state.kbFolders.find((f) => f.id === folderId)
      if (!folder) return state
      const targetParentId = parentFolderId ?? undefined
      // Refuse to drop a folder into itself or one of its own descendants.
      if (targetParentId === folderId) return state
      if (targetParentId && collectDescendantFolderIds(state.kbFolders, folderId).has(targetParentId)) return state
      // Refuse if the folder (or its deepest existing descendant) would land past the nesting cap.
      const targetDepth = targetParentId ? folderDepth(state.kbFolders, targetParentId) : 0
      const movingSubtreeDepth = folderSubtreeDepth(state.kbFolders, folderId)
      if (targetDepth + 1 + movingSubtreeDepth > MAX_KB_FOLDER_DEPTH) return state

      const siblings = state.kbFolders
        .filter((f) => f.id !== folderId && (f.parentFolderId ?? undefined) === targetParentId)
        .sort((a, b) => a.orderIndex - b.orderIndex)

      let insertAt = siblings.length
      if (afterFolderId) {
        const idx = siblings.findIndex((f) => f.id === afterFolderId)
        if (idx !== -1) insertAt = idx + 1
      }
      const reordered = [...siblings.slice(0, insertAt), folder, ...siblings.slice(insertAt)]
      const orderById = new Map(reordered.map((f, i) => [f.id, i]))
      const now = new Date().toISOString()

      return {
        kbFolders: state.kbFolders.map((f) => {
          if (f.id === folderId) {
            return { ...f, parentFolderId: targetParentId, orderIndex: orderById.get(f.id)!, updatedAt: now }
          }
          const order = orderById.get(f.id)
          return order == null ? f : { ...f, orderIndex: order }
        }),
        dirty: true,
      }
    })
  },
})
