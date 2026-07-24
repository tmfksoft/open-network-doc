import type { Database } from 'sql.js'
import type { KbFolder, KbPage } from '../../types'

export function writeKbFolders(db: Database, folders: KbFolder[]): void {
  const stmt = db.prepare(
    `INSERT INTO kb_folders (id, name, parent_folder_id, order_index, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
  for (const f of folders) {
    stmt.run([f.id, f.name, f.parentFolderId ?? null, f.orderIndex, f.createdAt, f.updatedAt])
  }
  stmt.free()
}

/** Old .ond files predate this table entirely — absence just means no folders to migrate. */
export function readKbFolders(db: Database): KbFolder[] {
  const result: KbFolder[] = []
  let stmt
  try {
    stmt = db.prepare(
      `SELECT id, name, parent_folder_id, order_index, created_at, updated_at
       FROM kb_folders ORDER BY order_index`,
    )
  } catch {
    return result
  }
  while (stmt.step()) {
    const row = stmt.getAsObject()
    result.push({
      id: row.id as string,
      name: row.name as string,
      parentFolderId: (row.parent_folder_id as string | null) ?? undefined,
      orderIndex: row.order_index as number,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    })
  }
  stmt.free()
  return result
}

export function writeKbPages(db: Database, pages: KbPage[]): void {
  const stmt = db.prepare(
    `INSERT INTO kb_pages (id, slug, title, folder_id, order_index, tags_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const p of pages) {
    stmt.run([
      p.id,
      p.slug,
      p.title,
      p.folderId ?? null,
      p.orderIndex,
      JSON.stringify(p.tags),
      p.createdAt,
      p.updatedAt,
    ])
  }
  stmt.free()
}

export interface ReadKbPagesResult {
  pages: KbPage[]
  /** Pre-folder-entity .ond files stored a `/`-delimited path string instead — kept
   *  here (keyed by page id) only so the loader can migrate it into real KbFolders. */
  legacyFolderPaths: Map<string, string>
}

export function readKbPages(db: Database): ReadKbPagesResult {
  const pages: KbPage[] = []
  const legacyFolderPaths = new Map<string, string>()
  // `SELECT *` rather than naming columns explicitly: a .ond saved before
  // folder_id existed (it had folder_path instead) would throw "no such
  // column" otherwise.
  const stmt = db.prepare('SELECT * FROM kb_pages ORDER BY order_index')
  while (stmt.step()) {
    const row = stmt.getAsObject()
    const folderId = (row.folder_id as string | null | undefined) ?? undefined
    const legacyPath = row.folder_path as string | null | undefined
    if (!folderId && legacyPath) legacyFolderPaths.set(row.id as string, legacyPath)
    pages.push({
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      folderId,
      orderIndex: row.order_index as number,
      tags: JSON.parse(row.tags_json as string),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    })
  }
  stmt.free()
  return { pages, legacyFolderPaths }
}
