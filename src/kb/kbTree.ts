import type { KbPage } from '../fileformat/types'

export interface KbTreeFolder {
  name: string
  path: string
  folders: KbTreeFolder[]
  pages: KbPage[]
}

/** Builds a virtual folder tree from each page's `/`-delimited `folderPath` — no separate folder table needed. */
export function buildKbTree(pages: KbPage[]): KbTreeFolder {
  const folderByPath = new Map<string, KbTreeFolder>()
  const root: KbTreeFolder = { name: '', path: '', folders: [], pages: [] }
  folderByPath.set('', root)

  function getFolder(path: string): KbTreeFolder {
    const existing = folderByPath.get(path)
    if (existing) return existing
    const parts = path.split('/')
    const name = parts[parts.length - 1]
    const parentPath = parts.slice(0, -1).join('/')
    const parent = getFolder(parentPath)
    const folder: KbTreeFolder = { name, path, folders: [], pages: [] }
    parent.folders.push(folder)
    folderByPath.set(path, folder)
    return folder
  }

  for (const page of pages) {
    const path = (page.folderPath ?? '').split('/').filter(Boolean).join('/')
    getFolder(path).pages.push(page)
  }

  for (const folder of folderByPath.values()) {
    folder.pages.sort((a, b) => a.orderIndex - b.orderIndex)
    folder.folders.sort((a, b) => a.name.localeCompare(b.name))
  }

  return root
}
