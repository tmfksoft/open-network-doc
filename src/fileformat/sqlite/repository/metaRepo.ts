import type { Database } from 'sql.js'
import { CURRENT_FORMAT_VERSION } from '../../types'
import { APP_VERSION } from '../../appVersion'

export interface DocMeta {
  docId: string
  docTitle: string
}

export function writeMeta(db: Database, meta: DocMeta): void {
  const stmt = db.prepare('INSERT INTO schema_meta (key, value) VALUES (?, ?)')
  const rows: [string, string][] = [
    ['schema_version', String(CURRENT_FORMAT_VERSION)],
    ['doc_id', meta.docId],
    ['doc_title', meta.docTitle],
    ['app_version', APP_VERSION],
    ['created_at', new Date().toISOString()],
  ]
  for (const [key, value] of rows) stmt.run([key, value])
  stmt.free()
}

export function readMeta(db: Database): DocMeta {
  const map: Record<string, string> = {}
  const stmt = db.prepare('SELECT key, value FROM schema_meta')
  while (stmt.step()) {
    const row = stmt.getAsObject()
    map[row.key as string] = row.value as string
  }
  stmt.free()
  return {
    docId: map.doc_id ?? crypto.randomUUID(),
    docTitle: map.doc_title ?? 'Untitled Network Document',
  }
}
