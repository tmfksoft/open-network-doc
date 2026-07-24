import type { KbFolder, KbPage } from '../fileformat/types'

export interface KbTreeFolder {
  /** null for the synthetic root — every real folder has its own KbFolder record. */
  folder: KbFolder | null
  folders: KbTreeFolder[]
  pages: KbPage[]
}

const ROOT_KEY = '__root__'
const keyFor = (id: string | undefined) => id ?? ROOT_KEY

/** Builds the nav tree from real KbFolder/KbPage entities and their parent/folder ids. */
export function buildKbTree(folders: KbFolder[], pages: KbPage[]): KbTreeFolder {
  const nodes = new Map<string, KbTreeFolder>()
  const root: KbTreeFolder = { folder: null, folders: [], pages: [] }
  nodes.set(ROOT_KEY, root)

  for (const folder of folders) {
    nodes.set(folder.id, { folder, folders: [], pages: [] })
  }
  for (const folder of folders) {
    const parent = nodes.get(keyFor(folder.parentFolderId)) ?? root
    parent.folders.push(nodes.get(folder.id)!)
  }
  for (const page of pages) {
    const parent = nodes.get(keyFor(page.folderId)) ?? root
    parent.pages.push(page)
  }

  for (const node of nodes.values()) {
    node.folders.sort((a, b) => (a.folder?.orderIndex ?? 0) - (b.folder?.orderIndex ?? 0))
    node.pages.sort((a, b) => a.orderIndex - b.orderIndex)
  }

  return root
}
