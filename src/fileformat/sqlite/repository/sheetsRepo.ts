import type { Database } from 'sql.js'
import type { Sheet } from '../../types'

export function writeSheets(db: Database, sheets: Sheet[]): void {
  const stmt = db.prepare(
    'INSERT INTO sheets (id, name, order_index, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
  )
  for (const s of sheets) {
    stmt.run([s.id, s.name, s.orderIndex, s.notes ?? null, s.createdAt, s.updatedAt])
  }
  stmt.free()
}

export function readSheets(db: Database): Sheet[] {
  const result: Sheet[] = []
  const stmt = db.prepare(
    'SELECT id, name, order_index, notes, created_at, updated_at FROM sheets ORDER BY order_index',
  )
  while (stmt.step()) {
    const row = stmt.getAsObject()
    result.push({
      id: row.id as string,
      name: row.name as string,
      orderIndex: row.order_index as number,
      notes: (row.notes as string | null) ?? undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    })
  }
  stmt.free()
  return result
}
