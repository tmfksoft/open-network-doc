import type { Database } from 'sql.js'
import type { DocNode, NodeType } from '../../types'

export function writeNodes(db: Database, nodes: DocNode[]): void {
  const stmt = db.prepare(
    `INSERT INTO nodes (id, sheet_id, type, parent_id, pos_x, pos_y, width, height, z_index, label, data_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const n of nodes) {
    stmt.run([
      n.id,
      n.sheetId,
      n.type,
      n.parentId ?? null,
      n.position.x,
      n.position.y,
      n.width ?? null,
      n.height ?? null,
      n.zIndex ?? null,
      n.label,
      JSON.stringify(n.data),
      n.createdAt,
      n.updatedAt,
    ])
  }
  stmt.free()
}

export function readNodes(db: Database): DocNode[] {
  const result: DocNode[] = []
  const stmt = db.prepare(
    `SELECT id, sheet_id, type, parent_id, pos_x, pos_y, width, height, z_index, label, data_json, created_at, updated_at
     FROM nodes`,
  )
  while (stmt.step()) {
    const row = stmt.getAsObject()
    result.push({
      id: row.id as string,
      sheetId: row.sheet_id as string,
      type: row.type as NodeType,
      parentId: (row.parent_id as string | null) ?? undefined,
      position: { x: row.pos_x as number, y: row.pos_y as number },
      width: (row.width as number | null) ?? undefined,
      height: (row.height as number | null) ?? undefined,
      zIndex: (row.z_index as number | null) ?? undefined,
      label: row.label as string,
      data: JSON.parse(row.data_json as string),
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    } as DocNode)
  }
  stmt.free()
  return result
}
