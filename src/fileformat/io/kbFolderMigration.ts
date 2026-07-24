import type { KbFolder, KbPage } from '../types'

/**
 * One-time upgrade path for .ond files saved before knowledgebase folders
 * were real entities: each page's `/`-delimited folder_path is turned into a
 * chain of KbFolder rows (deduped by path), and the page's folderId points at
 * the deepest one. Only runs when there are no real kb_folders already and at
 * least one page still carries a legacy path — later saves always use the
 * real folder table, so this only ever fires once per document.
 */
export function migrateLegacyKbFolderPaths(
  pages: KbPage[],
  existingFolders: KbFolder[],
  legacyFolderPaths: Map<string, string>,
): { pages: KbPage[]; folders: KbFolder[] } {
  if (existingFolders.length > 0 || legacyFolderPaths.size === 0) {
    return { pages, folders: existingFolders }
  }

  const now = new Date().toISOString()
  const folderIdByPath = new Map<string, string>()
  const folders: KbFolder[] = []
  const nextOrderByParent = new Map<string | undefined, number>()

  function ensureFolder(path: string): string {
    const existing = folderIdByPath.get(path)
    if (existing) return existing

    const parts = path.split('/')
    const name = parts[parts.length - 1]
    const parentPath = parts.slice(0, -1).join('/')
    const parentFolderId = parentPath ? ensureFolder(parentPath) : undefined

    const id = crypto.randomUUID()
    const orderIndex = nextOrderByParent.get(parentFolderId) ?? 0
    nextOrderByParent.set(parentFolderId, orderIndex + 1)

    folders.push({ id, name, parentFolderId, orderIndex, createdAt: now, updatedAt: now })
    folderIdByPath.set(path, id)
    return id
  }

  const migratedPages = pages.map((page) => {
    const legacyPath = legacyFolderPaths.get(page.id)
    if (!legacyPath) return page
    const cleanPath = legacyPath.split('/').filter(Boolean).join('/')
    if (!cleanPath) return page
    return { ...page, folderId: ensureFolder(cleanPath) }
  })

  return { pages: migratedPages, folders }
}
