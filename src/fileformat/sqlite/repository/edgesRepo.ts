import type { Database } from 'sql.js'
import type { DocEdge, EdgeType } from '../../types'

export function writeEdges(db: Database, edges: DocEdge[]): void {
  const stmt = db.prepare(
    `INSERT INTO edges (id, sheet_id, source_node_id, target_node_id, source_handle, target_handle, type, label, physical_link_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  for (const e of edges) {
    stmt.run([
      e.id,
      e.sheetId,
      e.sourceNodeId,
      e.targetNodeId,
      e.sourceHandle ?? null,
      e.targetHandle ?? null,
      e.type,
      e.label ?? null,
      e.physicalLink ? JSON.stringify(e.physicalLink) : null,
      e.createdAt,
      e.updatedAt,
    ])
  }
  stmt.free()
}

export function readEdges(db: Database): DocEdge[] {
  const result: DocEdge[] = []
  const stmt = db.prepare(
    `SELECT id, sheet_id, source_node_id, target_node_id, source_handle, target_handle, type, label, physical_link_json, created_at, updated_at
     FROM edges`,
  )
  while (stmt.step()) {
    const row = stmt.getAsObject()
    const physicalLinkJson = row.physical_link_json as string | null
    result.push({
      id: row.id as string,
      sheetId: row.sheet_id as string,
      sourceNodeId: row.source_node_id as string,
      targetNodeId: row.target_node_id as string,
      sourceHandle: (row.source_handle as string | null) ?? undefined,
      targetHandle: (row.target_handle as string | null) ?? undefined,
      type: row.type as EdgeType,
      label: (row.label as string | null) ?? undefined,
      physicalLink: physicalLinkJson ? JSON.parse(physicalLinkJson) : undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    })
  }
  stmt.free()
  return result
}
