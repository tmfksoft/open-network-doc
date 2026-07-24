import type { Database } from 'sql.js'
import type { KbPage } from '../../types'

export function writeKbPages(db: Database, pages: KbPage[]): void {
  const stmt = db.prepare(
    `INSERT INTO kb_pages (id, slug, title, folder_path, order_index, tags_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const p of pages) {
    stmt.run([
      p.id,
      p.slug,
      p.title,
      p.folderPath ?? null,
      p.orderIndex,
      JSON.stringify(p.tags),
      p.createdAt,
      p.updatedAt,
    ])
  }
  stmt.free()
}

export function readKbPages(db: Database): KbPage[] {
  const result: KbPage[] = []
  const stmt = db.prepare(
    `SELECT id, slug, title, folder_path, order_index, tags_json, created_at, updated_at
     FROM kb_pages ORDER BY order_index`,
  )
  while (stmt.step()) {
    const row = stmt.getAsObject()
    result.push({
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      folderPath: (row.folder_path as string | null) ?? undefined,
      orderIndex: row.order_index as number,
      tags: JSON.parse(row.tags_json as string),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    })
  }
  stmt.free()
  return result
}
